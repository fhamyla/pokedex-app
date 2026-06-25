import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
} from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { fetchPokemonList, fetchPokemonDetail } from '@/api/pokemon';
import {
  Typography,
  Spacing,
  BorderRadius,
  getTypeColor,
  capitalize,
  getBestSprite,
} from '@/constants/theme';
import type { PokemonDetail } from '@/types/pokemon';
import { ErrorState } from '@/components/ErrorState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HIGH_SCORE_KEY = '@pokedex_trivia_high_score';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Floating fire particle helper for perfect score celebration
function FloatingFire({ delay, style }: { delay: number; style: any }) {
  const floatAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.8);

  useEffect(() => {
    floatAnim.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 1500 }),
        -1, // Infinite loop
        false // Do not reverse, restart from 0
      )
    );
    scaleAnim.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 750 }),
          withTiming(0.8, { duration: 750 })
        ),
        -1,
        true
      )
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: -floatAnim.value * 70 },
        { scale: scaleAnim.value },
      ],
      opacity: 1 - floatAnim.value,
    };
  });

  return (
    <Animated.View style={[style, animatedStyle]}>
      <Ionicons name="flame" size={28} color="#FF5A00" />
    </Animated.View>
  );
}

// Option Button Component
interface OptionButtonProps {
  option: string;
  isCorrectAnswer: boolean;
  isSelected: boolean;
  isRevealed: boolean;
  onPress: () => void;
  colors: any;
  isDark: boolean;
  styles: any;
}

function OptionButton({
  option,
  isCorrectAnswer,
  isSelected,
  isRevealed,
  onPress,
  colors,
  isDark,
  styles,
}: OptionButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (isRevealed) return;
    scale.value = withSpring(0.96, { damping: 12, stiffness: 300 });
  };

  const handlePressOut = () => {
    if (isRevealed) return;
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  };

  // Determine button styles
  const btnStyles = [styles.optionBtn];
  const textStyles = [styles.optionText];

  if (isRevealed) {
    if (isCorrectAnswer) {
      btnStyles.push(styles.correctBtn);
      textStyles.push(styles.revealedBtnText);
    } else if (isSelected) {
      btnStyles.push(styles.incorrectBtn);
      textStyles.push(styles.revealedBtnText);
    } else {
      btnStyles.push(styles.disabledBtn);
      textStyles.push(styles.disabledText);
    }
  } else if (isSelected) {
    btnStyles.push(styles.selectedBtn);
    textStyles.push(styles.selectedText);
  }

  return (
    <AnimatedPressable
      style={[btnStyles, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={isRevealed}
      android_ripple={{ color: colors.surfaceLight }}
    >
      <Text style={textStyles} numberOfLines={1}>
        {capitalize(option.replace('-', ' '))}
      </Text>
    </AnimatedPressable>
  );
}

export default function TriviaScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = getStyles(colors, isDark);

  // Game States
  const [pokemonListCache, setPokemonListCache] = useState<{ id: number; name: string }[]>([]);
  const [targetPokemon, setTargetPokemon] = useState<PokemonDetail | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<'loading' | 'playing' | 'correct' | 'incorrect'>('loading');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [loadingGame, setLoadingGame] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // 5-Round Challenge States
  const [currentRound, setCurrentRound] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Animation values
  const revealAnim = useSharedValue(0);
  const bounceAnim = useSharedValue(1);
  const shakeAnim = useSharedValue(0);

  // Load High Score and Init Cache
  useEffect(() => {
    const init = async () => {
      try {
        const savedHighScore = await AsyncStorage.getItem(HIGH_SCORE_KEY);
        if (savedHighScore) {
          setHighScore(parseInt(savedHighScore, 10));
        }

        const response = await fetchPokemonList(0, 1025);
        const cache = response.results.map((p) => {
          const id = parseInt(p.url.split('/').filter(Boolean).pop()!, 10);
          return { id, name: p.name };
        });
        setPokemonListCache(cache);

        await startNewRound(cache);
      } catch (err) {
        setInitError('Failed to initialize Trivia Game. Check your connection!');
        setGameStatus('incorrect');
      }
    };
    init();
  }, []);

  // Start a new round
  const startNewRound = async (cache = pokemonListCache) => {
    if (cache.length === 0) return;
    setLoadingGame(true);
    setGameStatus('playing');
    setSelectedOption(null);
    setTargetPokemon(null);
    revealAnim.value = 0;
    bounceAnim.value = 1;
    shakeAnim.value = 0;

    try {
      const randomIndex = Math.floor(Math.random() * cache.length);
      const target = cache[randomIndex];

      const details = await fetchPokemonDetail(target.id);
      setTargetPokemon(details);

      const wrong: string[] = [];
      while (wrong.length < 3) {
        const randIdx = Math.floor(Math.random() * cache.length);
        const candidate = cache[randIdx];
        if (candidate.id !== target.id && !wrong.includes(candidate.name)) {
          wrong.push(candidate.name);
        }
      }

      const all = [target.name, ...wrong].sort(() => Math.random() - 0.5);
      setOptions(all);
    } catch (err) {
      console.warn('Failed to load next trivia question:', err);
    } finally {
      setLoadingGame(false);
    }
  };

  // Handle choice selection
  const handleSelect = async (option: string) => {
    if (gameStatus !== 'playing' || !targetPokemon) return;
    setSelectedOption(option);

    const isCorrect = option.toLowerCase() === targetPokemon.name.toLowerCase();

    if (isCorrect) {
      setGameStatus('correct');
      revealAnim.value = withTiming(1, { duration: 500 });
      bounceAnim.value = withSequence(
        withSpring(1.25, { damping: 4, stiffness: 100 }),
        withSpring(1, { damping: 8 })
      );
      
      const nextCorrectCount = correctCount + 1;
      setCorrectCount(nextCorrectCount);
      
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > highScore) {
        setHighScore(nextStreak);
        try {
          await AsyncStorage.setItem(HIGH_SCORE_KEY, nextStreak.toString());
        } catch (e) {
          console.warn('Failed to save high score:', e);
        }
      }
    } else {
      setGameStatus('incorrect');
      revealAnim.value = withTiming(1, { duration: 500 });
      shakeAnim.value = withSequence(
        withTiming(-15, { duration: 60 }),
        withTiming(15, { duration: 60 }),
        withTiming(-10, { duration: 60 }),
        withTiming(10, { duration: 60 }),
        withTiming(-5, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentRound < 5) {
      setCurrentRound((prev) => prev + 1);
      startNewRound();
    } else {
      setShowResults(true);
    }
  };

  const resetGame = () => {
    setCurrentRound(1);
    setCorrectCount(0);
    setShowResults(false);
    startNewRound();
  };

  // Reanimated styles
  const silhouetteStyle = useAnimatedStyle(() => ({
    opacity: 1 - revealAnim.value,
  }));

  const revealedStyle = useAnimatedStyle(() => ({
    opacity: revealAnim.value,
  }));

  const wrapperAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: bounceAnim.value },
      { translateX: shakeAnim.value },
    ],
  }));

  const spriteUrl = targetPokemon ? getBestSprite(targetPokemon.sprites) : null;
  const primaryType = targetPokemon?.types[0]?.type.name ?? 'normal';
  const typeColor = getTypeColor(primaryType);
  const isRevealed = gameStatus === 'correct' || gameStatus === 'incorrect';

  // Render Results Screen
  if (showResults) {
    const isPerfect = correctCount === 5;
    
    // Determine feedback texts
    let title = '';
    let subtitle = '';
    let message = '';

    if (correctCount === 5) {
      title = "Perfect Score!";
      subtitle = "Pokémon Master!";
      message = "5/5 Correct! You're a Pokémon Champion!";
    } else if (correctCount === 4) {
      title = "Excellent Trainer!";
      subtitle = "So close!";
      message = "4/5 Correct! Superb Pokémon knowledge!";
    } else if (correctCount === 3) {
      title = "Great Job!";
      subtitle = "Well played!";
      message = "3/5 Correct! You know your Pokémon!";
    } else if (correctCount >= 1) {
      title = "Keep Practicing!";
      subtitle = "Keep it up!";
      message = `${correctCount}/5 Correct! Practice makes perfect.`;
    } else {
      title = "Try Again! 🎮";
      subtitle = "Gotta catch 'em all!";
      message = "0/5 Correct. Don't give up, Trainer!";
    }

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <View style={styles.header}>
            <Text style={styles.title}>Challenge Results</Text>
            <Text style={styles.subtitle}>5-Round Pokémon Trivia</Text>
          </View>
        </View>

        <View style={styles.resultsContainer}>
          <View style={styles.trophyWrapper}>
            {isPerfect ? (
              <>
                <FloatingFire delay={0} style={[styles.flameParticle, { left: -35, bottom: 25 }]} />
                <FloatingFire delay={250} style={[styles.flameParticle, { right: -35, bottom: 25 }]} />
                <FloatingFire delay={500} style={[styles.flameParticle, { left: -15, bottom: 55 }]} />
                <FloatingFire delay={750} style={[styles.flameParticle, { right: -15, bottom: 55 }]} />
                <FloatingFire delay={1000} style={[styles.flameParticle, { left: 0, bottom: 15 }]} />
                <FloatingFire delay={1250} style={[styles.flameParticle, { right: 0, bottom: 15 }]} />
                
                <Animated.View style={styles.trophyCircle}>
                  <Ionicons name="trophy" size={70} color="#F4D03F" />
                </Animated.View>
              </>
            ) : (
              <View style={[styles.trophyCircle, { backgroundColor: colors.surfaceLight + '30' }]}>
                <Ionicons
                  name={correctCount >= 3 ? "star" : "game-controller"}
                  size={60}
                  color={correctCount >= 3 ? "#F4D03F" : colors.textMuted}
                />
              </View>
            )}
          </View>

          <Text style={styles.feedbackTitle}>{title}</Text>
          <Text style={styles.feedbackSubtitle}>{subtitle}</Text>

          <View style={styles.resultsCard}>
            <View style={styles.resultSummaryRow}>
              <Text style={styles.summaryLabel}>Correct Answers</Text>
              <Text style={styles.summaryValue}>{correctCount} / 5</Text>
            </View>

            <View style={styles.resultSummaryRow}>
              <Text style={styles.summaryLabel}>Total Score</Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>{correctCount * 100} pts</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.resultSummaryRow}>
              <Text style={styles.summaryLabel}>Active Streak</Text>
              <Text style={styles.summaryValue}>{streak}</Text>
            </View>
            <View style={styles.resultSummaryRow}>
              <Text style={styles.summaryLabel}>Best Streak</Text>
              <Text style={styles.summaryValue}>{highScore}</Text>
            </View>
          </View>

          <Text style={styles.feedbackMessage}>{message}</Text>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.playAgainBtn}
              onPress={resetGame}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={20} color="#ffffff" />
              <Text style={styles.playAgainBtnText}>Play Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.homeBtn}
              onPress={() => router.push('/')}
              activeOpacity={0.8}
            >
              <Ionicons name="home-outline" size={20} color={colors.textPrimary} />
              <Text style={styles.homeBtnText}>Return to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.header}>
          <Text style={styles.title}>Trivia</Text>
          <Text style={styles.subtitle}>Who's That Pokémon?</Text>
        </View>
        <TouchableOpacity
          style={styles.themeToggleBtn}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={20}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {initError ? (
        <ErrorState
          message={initError}
          onRetry={async () => {
            setInitError(null);
            setGameStatus('loading');
            try {
              const response = await fetchPokemonList(0, 1025);
              const cache = response.results.map((p) => {
                const id = parseInt(p.url.split('/').filter(Boolean).pop()!, 10);
                return { id, name: p.name };
              });
              setPokemonListCache(cache);
              await startNewRound(cache);
            } catch (err) {
              setInitError('Failed to initialize Trivia Game. Check your connection!');
              setGameStatus('incorrect');
            }
          }}
        />
      ) : (
        <View style={styles.gameContainer}>
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>ROUND</Text>
                <View style={styles.statValueRow}>
                  <Text style={styles.statIcon}></Text>
                  <Text style={styles.statValue}>{currentRound}/5</Text>
                </View>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>SCORE</Text>
                <View style={styles.statValueRow}>
                  <Text style={styles.statIcon}></Text>
                  <Text style={styles.statValue}>{correctCount * 100}</Text>
                </View>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>STREAK</Text>
                <View style={styles.statValueRow}>
                  <Text style={styles.statIcon}></Text>
                  <Text style={styles.statValue}>{streak}</Text>
                </View>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>BEST STREAK</Text>
                <View style={styles.statValueRow}>
                  <Text style={styles.statIcon}></Text>
                  <Text style={styles.statValue}>{highScore}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Silhouette Card */}
          <View style={styles.card}>
            <View
              style={[
                styles.bgCircle,
                { backgroundColor: isRevealed ? typeColor + '20' : colors.surfaceLight + '40' },
              ]}
            />
            {loadingGame || !targetPokemon ? (
              <ActivityIndicator color={colors.primary} size="large" style={styles.loader} />
            ) : (
              <View style={styles.spriteWrapper}>
                <Animated.View style={[styles.spriteWrapper, wrapperAnimatedStyle]}>
                  {/* Silhouette */}
                  <Animated.View style={[styles.spriteContainer, silhouetteStyle]}>
                    {spriteUrl && (
                      <Image
                        source={{ uri: spriteUrl }}
                        style={[styles.sprite, { tintColor: '#000' }]}
                        contentFit="contain"
                      />
                    )}
                  </Animated.View>

                  {/* Full Color Revealed */}
                  <Animated.View style={[styles.spriteContainer, styles.absoluteSprite, revealedStyle]}>
                    {spriteUrl && (
                      <Image
                        source={{ uri: spriteUrl }}
                        style={styles.sprite}
                        contentFit="contain"
                      />
                    )}
                  </Animated.View>
                </Animated.View>
              </View>
            )}
          </View>

          {/* Reveal Result Banner */}
          {isRevealed && targetPokemon && (
            <View style={styles.resultBanner}>
              <Text
                style={[
                  styles.resultTitle,
                  { color: gameStatus === 'correct' ? colors.success : colors.error },
                ]}
              >
                {gameStatus === 'correct' ? 'Correct! 🎉' : `Wrong! The answer was ${capitalize(targetPokemon.name.replace('-', ' '))}`}
              </Text>
            </View>
          )}

          {/* Game Options */}
          {!loadingGame && targetPokemon && (
            <View style={styles.optionsContainer}>
              <View style={styles.gridRow}>
                {options.map((option) => {
                  const isCorrectAnswer = option.toLowerCase() === targetPokemon.name.toLowerCase();
                  const isSelected = option === selectedOption;

                  return (
                    <OptionButton
                      key={option}
                      option={option}
                      isCorrectAnswer={isCorrectAnswer}
                      isSelected={isSelected}
                      isRevealed={isRevealed}
                      onPress={() => handleSelect(option)}
                      colors={colors}
                      isDark={isDark}
                      styles={styles}
                    />
                  );
                })}
              </View>

              {/* Next Question Button */}
              {isRevealed && (
                <TouchableOpacity
                  style={styles.nextBtn}
                  onPress={handleNext}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nextBtnText}>
                    {currentRound < 5 ? 'Next Pokémon' : 'See Results'}
                  </Text>
                  <Ionicons
                    name={currentRound < 5 ? "arrow-forward-outline" : "trophy-outline"}
                    size={20}
                    color="#ffffff"
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.base,
      paddingTop: Spacing.base,
      paddingBottom: Spacing.sm,
    },
    header: {
      flex: 1,
    },
    title: {
      color: colors.textPrimary,
      fontSize: Typography.sizes.xxl,
      fontWeight: Typography.weights.heavy,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: Typography.sizes.md,
      marginTop: Spacing.xs,
    },
    themeToggleBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.surfaceLight + '60',
    },
    gameContainer: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: Spacing.base,
      paddingTop: Spacing.sm,
    },
    statsGrid: {
      width: '100%',
      gap: Spacing.xs,
      marginBottom: Spacing.sm,
    },
    statsRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
      width: '100%',
    },
    statBox: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderWidth: 1,
      borderColor: colors.surfaceLight + '40',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    statLabel: {
      fontSize: 9,
      fontWeight: Typography.weights.bold,
      color: colors.textSecondary,
      letterSpacing: 1.2,
    },
    statValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
      gap: Spacing.xs,
    },
    statIcon: {
      fontSize: 14,
    },
    statValue: {
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.bold,
      color: colors.textPrimary,
    },
    card: {
      width: '100%',
      height: SCREEN_WIDTH * 0.65,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.surfaceLight + '40',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      marginBottom: Spacing.sm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    bgCircle: {
      position: 'absolute',
      width: SCREEN_WIDTH * 0.5,
      height: SCREEN_WIDTH * 0.5,
      borderRadius: SCREEN_WIDTH * 0.25,
    },
    loader: {
      transform: [{ scale: 1.2 }],
    },
    spriteWrapper: {
      width: SCREEN_WIDTH * 0.45,
      height: SCREEN_WIDTH * 0.45,
      justifyContent: 'center',
      alignItems: 'center',
    },
    spriteContainer: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    absoluteSprite: {
      position: 'absolute',
    },
    sprite: {
      width: '100%',
      height: '100%',
    },
    resultBanner: {
      alignItems: 'center',
      marginBottom: Spacing.xs,
    },
    resultTitle: {
      fontSize: Typography.sizes.md,
      fontWeight: Typography.weights.heavy,
      textAlign: 'center',
      paddingHorizontal: Spacing.md,
    },
    optionsContainer: {
      width: '100%',
      gap: Spacing.sm,
      marginTop: Spacing.xs,
    },
    gridRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: Spacing.sm,
    },
    optionBtn: {
      width: (SCREEN_WIDTH - Spacing.base * 2 - Spacing.sm) / 2,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.base,
      paddingHorizontal: Spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.surfaceLight + '50',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    optionText: {
      color: colors.textPrimary,
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.semibold,
      textAlign: 'center',
    },
    selectedBtn: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    selectedText: {
      color: colors.primary,
      fontWeight: Typography.weights.bold,
    },
    correctBtn: {
      backgroundColor: '#10B981',
      borderColor: '#059669',
      borderWidth: 1.5,
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 4,
    },
    incorrectBtn: {
      backgroundColor: '#EF4444',
      borderColor: '#DC2626',
      borderWidth: 1.5,
      shadowColor: '#EF4444',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 4,
    },
    disabledBtn: {
      backgroundColor: colors.surface,
      borderColor: colors.surfaceLight + '20',
      opacity: 0.4,
    },
    revealedBtnText: {
      color: '#ffffff',
      fontWeight: Typography.weights.bold,
    },
    disabledText: {
      color: colors.textMuted,
    },
    nextBtn: {
      width: '100%',
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.base,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: Spacing.sm,
      marginTop: Spacing.xs,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 3,
    },
    nextBtnText: {
      color: '#ffffff',
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.bold,
    },
    // Results Screen styles
    resultsContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.base,
      paddingBottom: Spacing.xl,
    },
    trophyWrapper: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.base,
      width: 140,
      height: 140,
    },
    flameParticle: {
      position: 'absolute',
      zIndex: 1,
    },
    trophyCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: '#FEF08A20',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#FDE04740',
      shadowColor: '#F59E0B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    },
    feedbackTitle: {
      fontSize: Typography.sizes.xl,
      fontWeight: Typography.weights.heavy,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: Spacing.xs,
    },
    feedbackSubtitle: {
      fontSize: Typography.sizes.md,
      fontWeight: Typography.weights.semibold,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.lg,
    },
    resultsCard: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.surfaceLight + '40',
      marginBottom: Spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    resultSummaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.sm,
    },
    summaryLabel: {
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.medium,
      color: colors.textSecondary,
    },
    summaryValue: {
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.bold,
      color: colors.textPrimary,
    },
    divider: {
      height: 1,
      backgroundColor: colors.surfaceLight + '50',
      marginVertical: Spacing.sm,
    },
    feedbackMessage: {
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.medium,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.lg,
    },
    actionsContainer: {
      width: '100%',
      gap: Spacing.md,
    },
    playAgainBtn: {
      width: '100%',
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.base,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: Spacing.sm,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 3,
    },
    playAgainBtnText: {
      color: '#ffffff',
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.bold,
    },
    homeBtn: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.base,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: Spacing.sm,
      borderWidth: 1.5,
      borderColor: colors.surfaceLight,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    homeBtnText: {
      color: colors.textPrimary,
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.bold,
    },
  });
