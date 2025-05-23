"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FiUser, FiEdit, FiTrash2, FiArrowLeft, FiCheck, FiX } from "react-icons/fi";
import Link from "next/link";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { UserDetail } from "@/lib/types";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/AuthContext";

// Form schema for validation
const userSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(10, "Phone number is too short")
    .max(11, "Phone number is too long"),
  role: z.enum(["Admin", "Organizer", "Staff"], {
    errorMap: () => ({ message: "Role is required" }),
  }),
  profileImage: z
    .union([z.instanceof(File), z.string().url().optional(), z.string().optional()])
    .optional()
    .nullable(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password is too long")
    .optional()
    .or(z.literal("")),
});

// Form data type
type FormData = z.infer<typeof userSchema>;

export default function UserDetails({ userId }: { userId: string }) {
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActiveUser, setIsActiveUser] = useState(false);
  const storage = getStorage();
  const { user: authUser, loading: authLoading } = useAuth()

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("UserName", authUser.displayName);
        const res = await fetch('/api/users');
        if (!res.ok) throw new Error("Failed to Fetch Users!!!");
        const data: UserDetail[] = await res.json();
        const user = data.find((u) => u.id === userId);
        if (!user) throw new Error("User not Found");
        setUser(user);
        
        // Set form default values
        setValue("name", user.name);
        setValue("email", user.email);
        setValue("phone", user.phone);
        setValue("role", user.role);
        setValue("profileImage", user.photoURL || "");
        setValue("password", "");
      } catch (err) {
        console.error(err);
        setError("Error fetching user data");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(userSchema),
  });

  // Handle image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setValue("profileImage", file);
      } catch (err) {
        setError("Failed to process image");
      }
    }
  };

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    if (!user) return;
    try {
      let downloadUrl = user.photoURL || "";

      if (data.profileImage && data.profileImage instanceof File) {
        const imageRef = ref(storage, `users/updated/${userId}_${Date.now()}`);
        const snapshot = await uploadBytes(imageRef, data.profileImage);
        downloadUrl = await getDownloadURL(snapshot.ref);
      }

      const response = await fetch(`/api/update-user/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: userId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          password: data.password,
          photoURL: downloadUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Update failed");

      setUser({ ...user, ...data, photoURL: downloadUrl });
      toast.success("Updated User Successfully")
      setIsEditing(false);
      reset(data);
      router.push("/users");
    } catch (err) {
      toast.error("Failed to Update")
      setError(err instanceof Error ? err.message : "Failed to update user");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!user || isActiveUser) return;

    // Create a custom confirmation toast with react-hot-toast
    const toastId = toast((t) => (
      <div className="flex flex-col gap-2 p-2">
        <p>Are you sure you want to delete this user?</p>
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-sm bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              performDelete();
            }}
            className="px-3 py-1 text-sm text-white bg-red-500 rounded-md"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: Infinity }); // Keep the toast until user interacts with it

    // Separated the delete functionality into its own function
    const performDelete = async () => {
      setIsDeleting(true);
      try {
        const res = await fetch(`/api/users/delete/${userId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const { error } = await res.json();
          throw new Error(error || "Failed to Delete User")
        }

        toast.success("Delete successful");
        router.push("/users");
      } catch (err) {
        setError("Failed to delete user");
        toast.error(error || "Failed to delete user");
        setIsDeleting(false);
      }
    };
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    hover: {
      scale: 1.02,
      boxShadow: "0 4px 12px rgba(106, 13, 173, 0.5)",
      transition: { duration: 0.2 },
    },
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative w-20 h-20">
          <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></div>
          <div className="relative inline-flex rounded-full h-20 w-20 bg-[#6A0DAD]">
            <FiUser className="h-10 w-10 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
        <p className="mt-4 text-lg font-medium text-[#6A0DAD]">Loading user details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">User not found</span>
        </div>
        <Link href="/users" className="mt-4 inline-flex items-center text-[#6A0DAD] hover:underline">
          <FiArrowLeft className="mr-2" /> Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#6A0DAD] mb-6 flex items-center gap-2">
        <FiUser /> User Details
        {isActiveUser && (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full ml-2">
            Active User
          </span>
        )}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <motion.div
        className={`backdrop-blur-md rounded-lg p-6 shadow-[0_4px_12px_rgba(106,13,173,0.3)] text-[#6A0DAD] ${
          isActiveUser ? "bg-[rgba(255,215,0,0.3)]" : "bg-[rgba(255,215,0,0.2)]"
        }`}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        {!isEditing ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Image
                  src={user.photoURL || "/user.png"}
                  alt={`${user.name}'s profile`}
                  width={80}
                  height={80}
                  className="rounded-full border-2 border-[#6A0DAD]"
                />
                {isActiveUser && (
                  <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center">
                    <FiCheck className="text-white text-xs" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-sm opacity-80">{user.role}</p>
              </div>
            </div>
            
            <div className="bg-opacity-60 rounded-lg p-4 space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone}</p>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-4">
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-sm bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD] transition-all duration-300 flex items-center gap-1"
              >
                <FiEdit /> Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting || user.id === authUser?.uid}
                className={`btn btn-sm text-white transition-all duration-300 flex items-center gap-1
                  ${isDeleting || user.id === authUser?.uid 
                    ? "bg-red-600 text-red-600 cursor-not-allowed" 
                    : "bg-red-600 hover:bg-red-500"
                }`}
                title={user.id === authUser?.uid ? "Cannot delete active user" : "Delete user"}
              >
                <FiTrash2 /> {isDeleting ? "Deleting..." : "Delete"}
              </button>
              <Link
                href="/users"
                className="btn btn-sm bg-gray-500 text-white hover:bg-gray-600 transition-all duration-300 flex items-center gap-1"
              >
                <FiArrowLeft /> Back to Users
              </Link>
            </div>
            
            {isActiveUser && (
              <div className="mt-2 text-sm text-gray-600 italic">
                Note: You cannot delete your own account while logged in.
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                {...register("name")}
                className="input input-bordered w-full bg-white text-[#6A0DAD] focus:border-[#6A0DAD] focus:ring-2 focus:ring-[#6A0DAD] focus:ring-opacity-50"
                placeholder="Enter name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                {...register("email")}
                className="input input-bordered w-full bg-white text-[#6A0DAD] focus:border-[#6A0DAD] focus:ring-2 focus:ring-[#6A0DAD] focus:ring-opacity-50"
                placeholder="Enter email"
                type="email"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                {...register("phone")}
                className="input input-bordered w-full bg-white text-[#6A0DAD] focus:border-[#6A0DAD] focus:ring-2 focus:ring-[#6A0DAD] focus:ring-opacity-50"
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                {...register("password")}
                className="input input-bordered w-full bg-white text-[#6A0DAD] focus:border-[#6A0DAD] focus:ring-2 focus:ring-[#6A0DAD] focus:ring-opacity-50"
                placeholder="Enter new password (optional)"
                type="password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                {...register("role")}
                className="select select-bordered w-full bg-white text-[#6A0DAD] focus:border-[#6A0DAD] focus:ring-2 focus:ring-[#6A0DAD] focus:ring-opacity-50"
              >
                <option value="Admin">Admin</option>
                <option value="Organizer">Organizer</option>
                <option value="Staff">Staff</option>
              </select>
              {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input file-input-bordered w-full bg-white text-[#6A0DAD] focus:border-[#6A0DAD] focus:ring-2 focus:ring-[#6A0DAD] focus:ring-opacity-50"
              />
              {user.photoURL && (
                <div className="mt-2">
                  <p className="text-sm mb-1">Current image:</p>
                  <Image
                    src={user.photoURL}
                    alt="Preview"
                    width={100}
                    height={100}
                    className="rounded border-2 border-[#6A0DAD]"
                  />
                </div>
              )}
              {errors.profileImage && (
                <p className="text-red-500 text-sm mt-1">{errors.profileImage.message}</p>
              )}
            </div>
            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-sm bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-1"
              >
                <FiCheck /> {isSubmitting ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  reset({
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    profileImage: user.photoURL || "",
                    password: "",
                  });
                }}
                className="btn btn-sm bg-gray-500 text-white hover:bg-gray-600 transition-all duration-300 flex items-center gap-1"
              >
                <FiX /> Cancel
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}