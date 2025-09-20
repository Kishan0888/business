import { db } from "./firebase"
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore"

// Types for our data structures
export interface Product {
  id: string
  name: string
  createdAt: Timestamp
}

export interface TeamMember {
  id: string
  name: string
  createdAt: Timestamp
}

export interface DataEntry {
  id: string
  channel: string
  date: string
  product?: string
  teamMember?: string
  // Dynamic fields based on channel
  [key: string]: any
  createdAt: Timestamp
}

export interface Target {
  id: string
  channel: string
  product: string
  amount: number
  createdAt: Timestamp
}

// Products
export const addProduct = async (name: string) => {
  return await addDoc(collection(db, "products"), {
    name,
    createdAt: Timestamp.now(),
  })
}

export const getProducts = async (): Promise<Product[]> => {
  const querySnapshot = await getDocs(query(collection(db, "products"), orderBy("name")))
  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as Product,
  )
}

export const deleteProduct = async (id: string) => {
  await deleteDoc(doc(db, "products", id))
}

// Team Members
export const addTeamMember = async (name: string) => {
  return await addDoc(collection(db, "teamMembers"), {
    name,
    createdAt: Timestamp.now(),
  })
}

export const getTeamMembers = async (): Promise<TeamMember[]> => {
  const querySnapshot = await getDocs(query(collection(db, "teamMembers"), orderBy("name")))
  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as TeamMember,
  )
}

export const deleteTeamMember = async (id: string) => {
  await deleteDoc(doc(db, "teamMembers", id))
}

// Data Entries
export const addDataEntry = async (entry: Omit<DataEntry, "id" | "createdAt">) => {
  return await addDoc(collection(db, "entries"), {
    ...entry,
    createdAt: Timestamp.now(),
  })
}

export const getDataEntries = async (channel?: string): Promise<DataEntry[]> => {
  let q = query(collection(db, "entries"), orderBy("createdAt", "desc"))

  if (channel) {
    q = query(collection(db, "entries"), where("channel", "==", channel), orderBy("createdAt", "desc"))
  }

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as DataEntry,
  )
}

export const updateDataEntry = async (id: string, updates: Partial<DataEntry>) => {
  await updateDoc(doc(db, "entries", id), updates)
}

export const deleteDataEntry = async (id: string) => {
  await deleteDoc(doc(db, "entries", id))
}

// Targets
export const addTarget = async (target: Omit<Target, "id" | "createdAt">) => {
  return await addDoc(collection(db, "targets"), {
    ...target,
    createdAt: Timestamp.now(),
  })
}

export const getTargets = async (): Promise<Target[]> => {
  const querySnapshot = await getDocs(query(collection(db, "targets"), orderBy("createdAt", "desc")))
  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as Target,
  )
}

export const deleteTarget = async (id: string) => {
  await deleteDoc(doc(db, "targets", id))
}
