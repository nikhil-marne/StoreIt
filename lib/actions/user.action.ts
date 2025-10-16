"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { parseStringify } from "../utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { avatarPlaceholderUrl } from "@/constants";

type CreateAccountProps = {
  fullName: string;
  email: string;
};

type VerifySecretProps = {
  accountId: string;
  password: string;
};

/**
 * Retrieves a user from the database by email address
 * @param email - User's email address
 * @returns User document if found, null otherwise
 */
const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("email", email)]
  );

  return result.total > 0 ? result.documents[0] : null;
};

/**
 * Centralized error handler for consistent logging
 * @param error - The error object
 * @param message - Custom error message
 */
const handleError = (error: unknown, message: string) => {
  console.error(message, error);
  throw error;
};

/**
 * Sends an OTP email to the user for authentication
 * @param email - User's email address
 * @returns userId if successful, undefined otherwise
 */
export const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(ID.unique(), email);
    return session.userId;
  } catch (error) {
    handleError(error, "Failed to send OTP email");
  }
};

/**
 * Creates a new user account and sends OTP verification email
 * @param fullName - User's full name
 * @param email - User's email address
 * @returns Object containing accountId
 */
export const createAccount = async ({
  fullName,
  email,
}: CreateAccountProps) => {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);

    // Send OTP email
    const accountId = await sendEmailOTP({ email });

    if (!accountId) {
      throw new Error("Failed to send OTP");
    }

    // Create user document if doesn't exist
    if (!existingUser) {
      const { databases } = await createAdminClient();

      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        ID.unique(),
        {
          fullName,
          email,
          avatar: avatarPlaceholderUrl,
          accountId,
        }
      );
    }

    return parseStringify({ accountId });
  } catch (error) {
    handleError(error, "Failed to create account");
  }
};

/**
 * Verifies the OTP and creates a session for the user
 * @param accountId - User's account ID
 * @param password - OTP password/token (the secret from the email)
 * @returns Object containing sessionId
 */
export const verifySecret = async ({
  accountId,
  password,
}: VerifySecretProps) => {
  try {
    const { account } = await createAdminClient();

    // Create session by verifying the email token
    // The password parameter is the OTP/secret sent to the user's email
    const session = await account.createSession(accountId, password);

    // Set secure session cookie
    const cookieStore = await cookies();
    cookieStore.set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, "Failed to verify OTP");
  }
};


export const getCurrentUser = async() => {
  const {databases, account} = await createSessionClient();

  const result = await account.get();

  const user = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("accountId", result.$id)]
  );

  if(user.total <= 0) return null;
  
  return parseStringify(user.documents[0])
};

export const signOutUser = async() => {
  const {account} = await createSessionClient();
  try{
      // Delete the current session
      await account.deleteSession('current');
      ((await cookies()).delete("appwrite-session"));
  } catch(error) {
    handleError(error, "Failed to sign out user.")
  } finally {
    redirect("/sign-in")
  }
}


export const SignInUser = async ({email}: {email: string}) => {
  try{
    const existingUser = await getUserByEmail(email);

    //User Exits, send one time password to email
    if(existingUser) {
      await sendEmailOTP({email});
      return parseStringify({accountId: existingUser.accountId});
    }
    
    return parseStringify({accountId: null, error: "User not found"})


  } catch(error) {
    handleError(error, "Failed to sign in user.")
  }
}