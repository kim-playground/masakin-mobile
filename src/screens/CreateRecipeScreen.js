import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { recipeAPI } from "../services/api";
import InputField from "../components/InputField";
import CustomButton from "../components/CustomButton";
import { colors, typography, spacing, borderRadius } from "../utils/theme";

const CreateRecipeScreen = ({ navigation }) => {
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Main Course",
    cookingTime: "",
    portions: "",
    difficulty: "Medium",
  });
  const [ingredients, setIngredients] = useState([
    { name: "", quantity: "", unit: "" },
  ]);
  const [steps, setSteps] = useState([{ description: "" }]);
  const [isDraft, setIsDraft] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const CATEGORIES = [
    "Appetizer",
    "Main Course",
    "Dessert",
    "Snack",
    "Beverage",
  ];
  const DIFFICULTIES = ["Easy", "Medium", "Hard"];

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: null });
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow access to your photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets]);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);
  };

  const updateIngredient = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const addStep = () => {
    setSteps([...steps, { description: "" }]);
  };

  const updateStep = (index, value) => {
    const updated = [...steps];
    updated[index].description = value;
    setSteps(updated);
  };

  const removeStep = (index) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.cookingTime)
      newErrors.cookingTime = "Cooking time is required";
    if (!formData.portions) newErrors.portions = "Portions is required";

    if (ingredients.some((ing) => !ing.name || !ing.quantity)) {
      newErrors.ingredients = "All ingredients must have name and quantity";
    }

    if (steps.some((step) => !step.description.trim())) {
      newErrors.steps = "All steps must have descriptions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // Create FormData for multipart upload
      const formDataToSend = new FormData();

      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("category", formData.category);
      formDataToSend.append("cooking_time", parseInt(formData.cookingTime));
      formDataToSend.append("portions", parseInt(formData.portions));
      formDataToSend.append("difficulty", formData.difficulty);
      formDataToSend.append("status", isDraft ? "draft" : "published");
      formDataToSend.append("ingredients", JSON.stringify(ingredients));
      formDataToSend.append("steps", JSON.stringify(steps));

      // Append images
      images.forEach((image, index) => {
        formDataToSend.append("images", {
          uri: image.uri,
          type: "image/jpeg",
          name: `recipe-${Date.now()}-${index}.jpg`,
        });
      });

      const response = await recipeAPI.create(formDataToSend);

      Alert.alert(
        "Success",
        `Recipe ${isDraft ? "saved as draft" : "published"} successfully!`,
        [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("Detail", { recipeId: response.data._id }),
          },
        ],
      );
    } catch (error) {
      console.error("Error creating recipe:", error);
      Alert.alert("Error", error.message || "Failed to create recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>Create New Recipe</Text>

        {/* Image Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Images</Text>
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={pickImages}
          >
            <Text style={styles.imagePickerIcon}>📷</Text>
            <Text style={styles.imagePickerText}>Add Images</Text>
          </TouchableOpacity>

          {images.length > 0 && (
            <View style={styles.imageGrid}>
              {images.map((image, index) => (
                <View key={index} style={styles.imagePreview}>
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.previewImage}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <InputField
            label="Recipe Title *"
            value={formData.title}
            onChangeText={(text) => updateField("title", text)}
            placeholder="e.g., Spicy Chicken Curry"
            error={errors.title}
          />

          <InputField
            label="Description *"
            value={formData.description}
            onChangeText={(text) => updateField("description", text)}
            placeholder="Describe your recipe..."
            multiline
            numberOfLines={4}
            error={errors.description}
          />

          {/* Category Selector */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.chip,
                  formData.category === cat && styles.chipActive,
                ]}
                onPress={() => updateField("category", cat)}
              >
                <Text
                  style={[
                    styles.chipText,
                    formData.category === cat && styles.chipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <InputField
                label="Cooking Time (min) *"
                value={formData.cookingTime}
                onChangeText={(text) => updateField("cookingTime", text)}
                placeholder="30"
                keyboardType="numeric"
                error={errors.cookingTime}
              />
            </View>
            <View style={styles.halfWidth}>
              <InputField
                label="Servings *"
                value={formData.portions}
                onChangeText={(text) => updateField("portions", text)}
                placeholder="4"
                keyboardType="numeric"
                error={errors.portions}
              />
            </View>
          </View>

          {/* Difficulty Selector */}
          <Text style={styles.label}>Difficulty</Text>
          <View style={styles.chipRow}>
            {DIFFICULTIES.map((diff) => (
              <TouchableOpacity
                key={diff}
                style={[
                  styles.chip,
                  formData.difficulty === diff && styles.chipActive,
                ]}
                onPress={() => updateField("difficulty", diff)}
              >
                <Text
                  style={[
                    styles.chipText,
                    formData.difficulty === diff && styles.chipTextActive,
                  ]}
                >
                  {diff}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {errors.ingredients && (
            <Text style={styles.errorText}>{errors.ingredients}</Text>
          )}
          {ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientRow}>
              <View style={styles.ingredientInputs}>
                <InputField
                  value={ingredient.name}
                  onChangeText={(text) => updateIngredient(index, "name", text)}
                  placeholder="Ingredient name"
                  style={styles.ingredientName}
                />
                <InputField
                  value={ingredient.quantity}
                  onChangeText={(text) =>
                    updateIngredient(index, "quantity", text)
                  }
                  placeholder="Qty"
                  keyboardType="numeric"
                  style={styles.ingredientQuantity}
                />
                <InputField
                  value={ingredient.unit}
                  onChangeText={(text) => updateIngredient(index, "unit", text)}
                  placeholder="Unit"
                  style={styles.ingredientUnit}
                />
              </View>
              {ingredients.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeIngredient(index)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
            <Text style={styles.addButtonText}>+ Add Ingredient</Text>
          </TouchableOpacity>
        </View>

        {/* Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {errors.steps && <Text style={styles.errorText}>{errors.steps}</Text>}
          {steps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <Text style={styles.stepNumber}>{index + 1}.</Text>
              <InputField
                value={step.description}
                onChangeText={(text) => updateStep(index, text)}
                placeholder={`Step ${index + 1}`}
                multiline
                style={styles.stepInput}
              />
              {steps.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeStep(index)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={addStep}>
            <Text style={styles.addButtonText}>+ Add Step</Text>
          </TouchableOpacity>
        </View>

        {/* Draft Toggle */}
        <View style={styles.draftRow}>
          <Text style={styles.draftLabel}>Save as Draft</Text>
          <TouchableOpacity
            style={[styles.toggle, isDraft && styles.toggleActive]}
            onPress={() => setIsDraft(!isDraft)}
          >
            <View
              style={[styles.toggleThumb, isDraft && styles.toggleThumbActive]}
            />
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <CustomButton
          title={isDraft ? "Save Draft" : "Publish Recipe"}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
  },
  screenTitle: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  section: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  imagePickerButton: {
    borderWidth: 2,
    borderColor: colors.gray,
    borderStyle: "dashed",
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: "center",
  },
  imagePickerIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  imagePickerText: {
    ...typography.body,
    color: colors.darkGray,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.md,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: borderRadius.sm,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  removeImageText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  label: {
    ...typography.bodySmall,
    fontWeight: "600",
    marginBottom: spacing.xs,
    color: colors.text,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.lightGray,
    borderWidth: 2,
    borderColor: colors.transparent,
  },
  chipActive: {
    backgroundColor: colors.background,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  ingredientInputs: {
    flex: 1,
    flexDirection: "row",
  },
  ingredientName: {
    flex: 2,
    marginRight: spacing.xs,
  },
  ingredientQuantity: {
    flex: 1,
    marginRight: spacing.xs,
  },
  ingredientUnit: {
    flex: 1,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  stepNumber: {
    ...typography.h4,
    color: colors.primary,
    marginTop: spacing.md,
    marginRight: spacing.sm,
  },
  stepInput: {
    flex: 1,
  },
  removeButton: {
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  removeButtonText: {
    color: colors.error,
    fontSize: 20,
    fontWeight: "bold",
  },
  addButton: {
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    borderStyle: "dashed",
  },
  addButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  draftRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  draftLabel: {
    ...typography.body,
    fontWeight: "600",
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: colors.accent,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
  submitButton: {
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.sm,
  },
});

export default CreateRecipeScreen;
