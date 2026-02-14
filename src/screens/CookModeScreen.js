import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, borderRadius } from "../utils/theme";

const { width } = Dimensions.get("window");

const CookModeScreen = ({ route, navigation }) => {
  const { recipe } = route.params;
  const [currentStep, setCurrentStep] = useState(0);
  const steps = recipe.steps || [];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleExit = () => {
    navigation.goBack();
  };

  const handleFinish = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
          <Text style={styles.exitButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{recipe.title}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Step {currentStep + 1} of {steps.length}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentStep + 1) / steps.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Step Content */}
      <View style={styles.content}>
        <View style={styles.stepCard}>
          <View style={styles.stepNumberBadge}>
            <Text style={styles.stepNumberText}>{currentStep + 1}</Text>
          </View>
          <Text style={styles.stepDescription}>
            {steps[currentStep]?.description || steps[currentStep]}
          </Text>
        </View>

        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentStep && styles.activeDot]}
            />
          ))}
        </View>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentStep === 0 && styles.navButtonDisabled,
          ]}
          onPress={handlePrevious}
          disabled={currentStep === 0}
        >
          <Text style={styles.navButtonText}>← Previous</Text>
        </TouchableOpacity>

        {currentStep === steps.length - 1 ? (
          <TouchableOpacity
            style={[styles.navButton, styles.finishButton]}
            onPress={handleFinish}
          >
            <Text style={[styles.navButtonText, styles.finishButtonText]}>
              Finish 🎉
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navButton} onPress={handleNext}>
            <Text style={styles.navButtonText}>Next →</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  exitButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  exitButtonText: {
    fontSize: 24,
    color: colors.darkGray,
  },
  headerTitle: {
    ...typography.h4,
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
  },
  progressText: {
    ...typography.bodySmall,
    color: colors.darkGray,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray,
    borderRadius: borderRadius.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.accent,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  stepCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: width - spacing.xl * 2,
    minHeight: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  stepNumberText: {
    ...typography.h2,
    color: colors.white,
  },
  stepDescription: {
    ...typography.h3,
    textAlign: "center",
    lineHeight: 32,
  },
  dotsContainer: {
    flexDirection: "row",
    marginTop: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray,
    marginHorizontal: spacing.xs,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 24,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
  },
  navButton: {
    flex: 1,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  navButtonDisabled: {
    backgroundColor: colors.gray,
    opacity: 0.5,
  },
  navButtonText: {
    ...typography.button,
    color: colors.white,
  },
  finishButton: {
    backgroundColor: colors.accent,
  },
  finishButtonText: {
    fontWeight: "bold",
  },
});

export default CookModeScreen;
