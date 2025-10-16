"use server";

import { Account, Avatars, Client, Databases, Storage } from "node-appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Creates a session-based client for authenticated users
 * Uses the session cookie to authenticate requests
 * Redirects to sign-in if no session exists
 */
export const createSessionClient = async () => {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl)
    .setProject(appwriteConfig.projectId);

  const cookieStore = await cookies();
  const session = cookieStore.get("appwrite-session");

  if (!session || !session.value) {
    redirect("/sign-in");
  }

  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
  };
};

/**
 * Gets the current logged-in user or returns null
 * Use this to check authentication without throwing errors
 */
export const getCurrentUser = async () => {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("appwrite-session");

    if (!session || !session.value) {
      return null;
    }

    const client = new Client()
      .setEndpoint(appwriteConfig.endpointUrl)
      .setProject(appwriteConfig.projectId);

    client.setSession(session.value);

    const account = new Account(client);
    const user = await account.get();

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Creates an admin client with full access
 * Uses the secret API key for server-side operations
 */
export const createAdminClient = async () => {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl)
    .setProject(appwriteConfig.projectId)
    .setKey(appwriteConfig.secretKey);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get storage() {
      return new Storage(client);
    },
    get avatars() {
      return new Avatars(client);
    },
  };
};