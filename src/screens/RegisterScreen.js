import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import InputField from "../components/InputField";
import CustomButton from "../components/CustomButton";
import { colors, typography, spacing } from "../utils/theme";

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: null });
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
    });
    setLoading(false);

    if (!result.success) {
      // Show backend errors if available
      if (result.errors) {
        setErrors(result.errors);
      } else {
        Alert.alert("Registration Failed", result.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🍳</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Masakin community</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <InputField
              label="Full Name"
              value={formData.name}
              onChangeText={(text) => updateField("name", text)}
              placeholder="Enter your full name"
              error={errors.name}
            />

            <InputField
              label="Email"
              value={formData.email}
              onChangeText={(text) => updateField("email", text)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <InputField
              label="Password"
              value={formData.password}
              onChangeText={(text) => updateField("password", text)}
              placeholder="Create a password"
              secureTextEntry
              autoCapitalize="none"
              error={errors.password}
            />

            <InputField
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(text) => updateField("confirmPassword", text)}
              placeholder="Confirm your password"
              secureTextEntry
              autoCapitalize="none"
              error={errors.confirmPassword}
            />

            <CustomButton
              title="Register"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />

            {/* Login Link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.darkGray,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  registerButton: {
    marginTop: spacing.md,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  loginText: {
    ...typography.body,
    color: colors.darkGray,
  },
  loginLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "bold",
  },
});

export default RegisterScreen;
