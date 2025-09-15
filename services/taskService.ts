import api from "./config/api"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where
} from "firebase/firestore"
import { db } from "@/firebase"
import { Task } from "@/types/task"

// tasks
export const tasksRef = collection(db, "tasks")

export const getAllTaskByUserId = async (userId: string) => {
  const q = query(tasksRef, where("userId", "==", userId))

  const querySnapshot = await getDocs(q)
  const taskList = querySnapshot.docs.map((taskRef) => ({
    id: taskRef.id,
    ...taskRef.data()
  })) as Task[]
  return taskList
}

export const createTask = async (task: Task) => {
  const docRef = await addDoc(tasksRef, task)
  return docRef.id
}

export const getAllTask = async () => {
  const snapshot = await getDocs(tasksRef)
  return snapshot.docs.map((task) => ({
    id: task.id,
    ...task.data()
  })) as Task[]
}

export const getTaskById = async (id: string) => {
  const taskDocRef = doc(db, "tasks", id)
  const snapshot = await getDoc(taskDocRef)
  return snapshot.exists()
    ? ({
        id: snapshot.id,
        ...snapshot.data()
      } as Task)
    : null
}

export const deleteTask = async (id: string) => {
  const taskDocRef = doc(db, "tasks", id)
  return deleteDoc(taskDocRef)
}

export const updateTask = async (id: string, task: Task) => {
  const taskDocRef = doc(db, "tasks", id)
  const { id: _id, ...taskData } = task // remove id
  return updateDoc(taskDocRef, taskData)
}

export const getTasks = async () => {
  const response = await api.get("/tasks")
  return response.data
}

export const addTask = async (task: {
  title: string
  description?: string
}) => {
  const res = await api.post("/tasks", task)
  return res.data
}
