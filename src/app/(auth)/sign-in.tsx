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

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");

  const { height } = useWindowDimensions();
  const isLoading = fetchStatus === "fetching";

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
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Image
          source={require("../../../assets/images/main-plazly.png")}
          className="w-32 h-16 mb-8"
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Verify your account
        </Text>
        <Text className="text-gray-500 mb-8 text-center">
          We sent a code to {email}
        </Text>

        <TextInput
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4"
          placeholder="Enter verification code"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
        />
        {errors?.fields?.code && (
          <Text className="text-red-500 mb-4">
            {errors.fields.code.message}
          </Text>
        )}

        <TouchableOpacity
          onPress={onVerifyPress}
          disabled={isLoading}
          className="w-full bg-blue-600 py-4 rounded-xl items-center mb-4"
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Verify</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => signIn.mfa.sendEmailCode()}
          className="py-2"
        >
          <Text className="text-blue-600">I need a new code</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="bg-white"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="px-6 py-12 justify-between" style={{ minHeight: height }}>
        <View className="flex-1 justify-center w-full">
          <Image
            source={require("../../../assets/images/main-plazly.png")}
            className="w-32 h-16 mb-8"
            resizeMode="contain"
          />
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back!
          </Text>
          <Text className="text-gray-500 mb-8">Sign in to your account</Text>

          <TextInput
            className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4"
            placeholder="Email address"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.fields.identifier && (
            <Text className="text-red-500 mb-4">
              {errors.fields.identifier.message}
            </Text>
          )}

          <View className="relative w-full mb-6">
            <TextInput
              className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 text-black"
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
          {errors.fields.password && (
            <Text className="text-red-500 mb-4">
              {errors.fields.password.message}
            </Text>
          )}

          <TouchableOpacity
            onPress={onSignInPress}
            disabled={isLoading}
            className="w-full bg-blue-600 py-4 rounded-xl items-center mb-4"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">Sign in</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center">
            <Text className="text-gray-500">Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => (router as any).push("/onboarding")}>
              <Text className="text-blue-600 font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text
          style={{
            fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
            fontStyle: "italic",
          }}
          className="text-center text-gray-900 text-base mt-8"
        >
          Your Property Marketplace
        </Text>

        <View nativeID="clerk-captcha" />
      </View>
    </ScrollView>
  );
}
