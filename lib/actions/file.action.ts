"use server";

import { createAdminClient, getCurrentUser, createSessionClient } from "../appwrite";
import { InputFile } from "node-appwrite/file";
import { appwriteConfig } from "../appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";

/**
 * Centralized error handler
 */
const handleError = (error: unknown, message: string) => {
  console.error(message, error);
  throw error;
};

/**
 * Uploads a file to Appwrite Storage and creates a document in the database
 */
export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) => {
  const { storage, databases } = await createAdminClient();

  try {
    const inputFile = InputFile.fromBuffer(file, file.name);

    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      inputFile
    );

    const fileDocument = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
    };

    const newFile = await databases
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        ID.unique(),
        fileDocument
      )
      .catch(async (error: unknown) => {
        await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
        handleError(error, "Failed to create file document");
      });

    revalidatePath(path);

    return parseStringify(newFile);
  } catch (error) {
    handleError(error, "Failed to upload file");
  }
};

/**
 * Creates queries for fetching files
 * Query files where:
 * - owner matches current user ID, OR
 * - accountId matches current user's account ID, OR
 * - users array contains current user's email
 */
const createQueries = (
  currentUser: Models.User<Models.Preferences>,
  types: string[],
  searchText: string,
  sort: string,
  limit?: number) => {

  const queries = [
    Query.or([
      Query.equal("owner", currentUser.$id),
      Query.equal("accountId", currentUser.$id),
      Query.contains("users", [currentUser.email])
    ]),
  ];

  if(types.length > 0) queries.push(Query.equal("type", types));
  if(searchText) queries.push(Query.search("name", searchText));
  if(limit) queries.push(Query.limit(limit));

  let sortKey = sort;
  if (sort === 'latest') {
    sortKey = '$createdAt-desc';
  } else if (sort === 'oldest') {
    sortKey = '$createdAt-asc';
  }
  // Add other custom sort mappings here (e.g., if sort === 'name' then sortKey = 'name-asc')
  
  // 2. Safely extract sortBy and orderBy
  const parts = sortKey.split('-');
  const sortBy = parts[0];
  const orderBy = parts[1] || 'desc'; // Default to 'desc' if no order is provided (e.g., when 'name' is passed)

  // 3. Add the sorting query
  // Note: We check if sortBy is a valid value before adding the query
  if (sortBy) {
    queries.push(orderBy === 'asc' ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy));
  }

  return queries;
}

/**
 * Fetches files for the current user with owner information populated
 */
export const getFiles = async ({types = [], searchText = '', sort = '$createdAt-desc', limit}: GetFilesProps) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) throw new Error("User not found");

    const queries = createQueries(currentUser, types, searchText, sort, limit);

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      queries,
    );

    // Populate owner information for each file
    const filesWithOwner = await Promise.all(
      files.documents.map(async (file) => {
        // Fetch the owner's user document
        const ownerDoc = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.usersCollectionId,
          [Query.equal("$id", file.owner)]
        );

        // Attach the owner's info to the file
        return {
          ...file,
          owner: ownerDoc.documents[0] || {
            fullName: "Unknown User",
            email: "",
            avatar: ""
          }
        };
      })
    );

    return parseStringify({ 
      ...files, 
      documents: filesWithOwner 
    });

  } catch (error) {
    handleError(error, "Unable to get files.");
  }
};


export const renameFile = async ({fileId, name, extension, path} : RenameFileProps ) => {
  const { databases } = await createAdminClient();

  try {
    const newName = `${name}.${extension}`;
    
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        name: newName,
      },
    );

    revalidatePath(path);
    return parseStringify(updatedFile); 

  } catch (error) {
    handleError(error, "Failed to rename file.");
  }
};



export const updateFileUsers = async ({fileId, emails, path} : UpdateFileUsersProps ) => {
  const { databases } = await createAdminClient();

  try {
    
    
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        users: emails,
      },
    );

    revalidatePath(path);
    return parseStringify(updatedFile); 

  } catch (error) {
    handleError(error, "Failed to rename file.");
  }
};



export const deleteFile = async ({fileId, bucketFileId, path} : DeleteFileProps ) => {
  const { databases, storage } = await createAdminClient();

  try {
    
    
    const deletedFile = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
    );

    if(deletedFile) {
      await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
    }

    revalidatePath(path);
    return parseStringify({status: 'success'}); 

  } catch (error) {
    handleError(error, "Failed to rename file.");
  }
};

export async function getTotalSpaceUsed() {
  try {
    const { databases } = await createSessionClient();
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User is not authenticated.");

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [
        Query.or([
          Query.equal("owner", currentUser.$id),
          Query.equal("accountId", currentUser.$id),
          Query.contains("users", [currentUser.email])
        ])
      ],
    );

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024 /* 2GB available bucket storage */,
    };

    files.documents.forEach((file) => {
      const fileType = file.type as FileType;
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;

      if (
        !totalSpace[fileType].latestDate ||
        new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
      ) {
        totalSpace[fileType].latestDate = file.$updatedAt;
      }
    });

    return parseStringify(totalSpace);
  } catch (error) {
    handleError(error, "Error calculating total space used:, ");
  }
}