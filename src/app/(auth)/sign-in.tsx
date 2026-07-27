import { useSignIn } from "@clerk/expo";
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

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");

  const { height } = useWindowDimensions();
  const isLoading = fetchStatus === "fetching";

  const logoSrc = isDark
    ? require("../../../assets/images/main-plazly-black1.png")
    : require("../../../assets/images/main-plazly.png");

  const onSignInPress = async () => {
    const { error } = await signIn.password({
      emailAddress: email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }
          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
    } else if (signIn.status === "needs_second_factor") {
      await signIn.mfa.sendPhoneCode();
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );

      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      } else {
        console.error("Sign-in attempt not complete:", signIn);
      }
    }
  };

  const onVerifyPress = async () => {
    await signIn.mfa.verifyEmailCode({
      code,
    });

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }
          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
    }
  };

  if (signIn?.status === "needs_client_trust") {
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
        {errors?.fields?.code && (
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

        <TouchableOpacity
          onPress={() => signIn.mfa.sendEmailCode()}
          style={{ paddingVertical: 8 }}
        >
          <Text style={{ color: colors.primary }}>I need a new code</Text>
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
            Welcome back!
          </Text>
          <Text style={{ color: colors.textMuted, marginBottom: 32 }}>Sign in to your account</Text>

          <TextInput
            style={{ width: "100%", borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, color: colors.text }}
            placeholder="Email address"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.fields.identifier && (
            <Text style={{ color: colors.danger, marginBottom: 16 }}>
              {errors.fields.identifier.message}
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
            onPress={onSignInPress}
            disabled={isLoading}
            style={{ width: "100%", backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: "center", marginBottom: 16 }}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Sign in</Text>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Text style={{ color: colors.textMuted }}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => (router as any).push("/onboarding")}>
              <Text style={{ color: colors.primary, fontWeight: "600" }}>Sign Up</Text>
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
