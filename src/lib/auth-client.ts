import { createAuthClient } from "better-auth/react"
import { expoClient } from "@better-auth/expo/client"
import { phoneNumberClient } from "better-auth/client/plugins"
import * as SecureStore from "expo-secure-store"

const baseURL = process.env.EXPO_PUBLIC_API_URL || "https://aicarry.online"

export const authClient = createAuthClient({
  baseURL,
  plugins: [
    expoClient({
      scheme: "carry",
      storagePrefix: "carry_auth",
      storage: SecureStore,
    }) as any,
    phoneNumberClient(),
  ],
})
