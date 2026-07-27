import { useAuth, useSignUp } from "@clerk/expo";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useTheme } from "../../../lib/theme";

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");

  const { height } = useWindowDimensions();
  const isLoading = fetchStatus === "fetching";

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  const logoSrc = isDark
    ? require("../../../assets/images/main-plazly-black1.png")
    : require("../../../assets/images/main-plazly.png");

  const onSignUpPress = async () => {
    const { error } = await signUp.password({
      emailAddress: email,
      password,
      firstName,
      lastName,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (!error) await signUp.verifications.sendEmailCode();
  };

  const onVerifyPress = async () => {
    await signUp.verifications.verifyEmailCode({
      code,
    });

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
    }
  };

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg, paddingHorizontal: 24 }}>
        <Image
          source={logoSrc}
          style={{ width: 128, height: 64, marginBottom: 32 }}
          resizeMode="contain"
        />
        <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.text, marginBottom: 8 }}>
          Verify your account
        </Text>
        <Text style={{ color: colors.textMuted, marginBottom: 32, textAlign: "center" }}>
          We sent a code to {email}
        </Text>

        <TextInput
          style={{ width: "100%", borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, color: colors.text }}
          placeholder="Enter verification code"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
        />
        {errors.fields.code && (
          <Text style={{ color: colors.danger, marginBottom: 16 }}>
            {errors.fields.code.message}
          </Text>
        )}

        <TouchableOpacity
          onPress={onVerifyPress}
          disabled={isLoading}
          style={{ width: "100%", backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: "center", marginBottom: 16 }}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Verify</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => signUp.verifications.sendEmailCode()} style={{ paddingVertical: 8 }}>
          <Text style={{ color: colors.primary }}>I need a new code</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => signUp.reset()} style={{ paddingVertical: 8 }}>
          <Text style={{ color: colors.primary }}>Start over</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={{ paddingHorizontal: 24, paddingVertical: 48, justifyContent: "space-between", minHeight: height }}>
        <View style={{ flex: 1, justifyContent: "center", width: "100%" }}>
          <Image
            source={logoSrc}
            style={{ width: 128, height: 64, marginBottom: 32 }}
            resizeMode="contain"
          />
          <Text style={{ fontSize: 30, fontWeight: "bold", color: colors.text, marginBottom: 8 }}>
            Create account
          </Text>
          <Text style={{ color: colors.textMuted, marginBottom: 32 }}>Find your dream home today</Text>

          <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
            <TextInput
              style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: colors.text }}
              placeholder="First name"
              placeholderTextColor={colors.textMuted}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />

            <TextInput
              style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: colors.text }}
              placeholder="Last name"
              placeholderTextColor={colors.textMuted}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>

          <TextInput
            style={{ width: "100%", borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, color: colors.text }}
            placeholder="Email address"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.fields.emailAddress && (
            <Text style={{ color: colors.danger, marginBottom: 16 }}>
              {errors.fields.emailAddress.message}
            </Text>
          )}

          <View style={{ width: "100%", marginBottom: 24, position: "relative" }}>
            <TextInput
              style={{ width: "100%", borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, paddingRight: 48, color: colors.text }}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: 12, top: 0, bottom: 0, justifyContent: "center" }}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>
          {errors.fields.password && (
            <Text style={{ color: colors.danger, marginBottom: 16 }}>
              {errors.fields.password.message}
            </Text>
          )}

          <TouchableOpacity
            onPress={onSignUpPress}
            disabled={isLoading}
            style={{ width: "100%", backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: "center", marginBottom: 16 }}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Text style={{ color: colors.textMuted }}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/sign-in")}>
              <Text style={{ color: colors.primary, fontWeight: "600" }}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text
          style={{
            fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
            fontStyle: "italic",
            textAlign: "center",
            color: colors.text,
            fontSize: 16,
            marginTop: 32,
          }}
        >
          Your Property Marketplace
        </Text>

        <View nativeID="clerk-captcha" />
      </View>
    </ScrollView>
  );
}
