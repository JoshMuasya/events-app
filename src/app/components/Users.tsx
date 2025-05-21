"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUsers, FiX, FiPlus, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FaSort, FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { UserDetail, UserField } from "@/lib/types";
import toast from "react-hot-toast";
import { debounce } from "lodash";
import { useAuth } from "@/lib/AuthContext";

// Form schema for validation, matching UserDetails
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

// Define fields array with explicit type
const fields: UserField[] = ["name", "email", "phone", "role"];

export default function Users() {
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [sortField, setSortField] = useState<UserField>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const usersPerPage = 10;
  const storage = getStorage();

  const { user: authUser, loading: authLoading } = useAuth()

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    setFocus,
  } = useForm<FormData>({
    resolver: zodResolver(userSchema),
  });

  // Debounced search handler
  const debouncedSetSearchQuery = useMemo(() => debounce(setSearchQuery, 300), []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  // Sorting logic
  const handleSort = (field: UserField) => {
    const newOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newOrder);

    const sortedUsers = [...users].sort((a, b) => {
      const valA = a[field] ? a[field].toLowerCase() : "";
      const valB = b[field] ? b[field].toLowerCase() : "";
      return newOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valB);
    });
    setUsers(sortedUsers);
  };

  // Search and filter logic
  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      searchQuery
        ? Object.values(user)
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
        : true
    );
  }, [users, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    hover: {
      scale: 1.02,
      boxShadow: "0 4px 12px rgba(106, 13, 173, 0.5)",
      transition: { duration: 0.2 },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 4px 12px rgba(106, 13, 173, 0.5)",
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.95, transition: { duration: 0.1 } },
  };

  const formVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        opacity: { duration: 0.3 },
        height: { duration: 0.4, ease: "easeOut" },
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        opacity: { duration: 0.2 },
        height: { duration: 0.3, ease: "easeIn" },
      },
    },
  };

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
    try {
      let downloadUrl = "";

      if (data.profileImage && data.profileImage instanceof File) {
        const imageRef = ref(storage, `users/${Date.now()}_${data.profileImage.name}`);
        const snapshot = await uploadBytes(imageRef, data.profileImage);
        downloadUrl = await getDownloadURL(snapshot.ref);
      }

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          password: data.password,
          image: downloadUrl,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to create user");
      }

      const newUser = await response.json();
      toast.success("User Added Successfully");
      setIsAddingUser(false);
      reset();
      setError(null);

      await fetchUsers();
    } catch (err) {
      toast.error("Failed to Add User");
      setError(err instanceof Error ? err.message : "Failed to create user");
    }
  };

  // Toggle add user form
  const toggleAddUserForm = () => {
    setIsAddingUser(!isAddingUser);
    if (isAddingUser) {
      reset();
      setError(null);
    } else {
      setTimeout(() => setFocus("name"), 0); // Focus on name input when form opens
    }
  };

  // Stats
  const totalUsers = filteredUsers.length;
  const totalAdmins = filteredUsers.filter((u) => u.role.toLowerCase() === "admin").length;
  const totalOrganizers = filteredUsers.filter((u) => u.role.toLowerCase() === "organizer").length;
  const totalStaff = filteredUsers.filter((u) => u.role.toLowerCase() === "staff").length;

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div
          className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#6A0DAD]"
          role="status"
          aria-label="Loading users"
        ></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#6A0DAD] flex items-center gap-2">
          <FiUsers aria-hidden="true" /> Manage Users
        </h1>
        <motion.button
          className="bg-[#6A0DAD] text-[#FFD700] px-4 py-2 rounded-lg flex items-center gap-2"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={toggleAddUserForm}
          aria-label={isAddingUser ? "Hide add user form" : "Add new user"}
        >
          {isAddingUser ? (
            <>
              <FiChevronUp aria-hidden="true" /> Hide Form
            </>
          ) : (
            <>
              <FiPlus aria-hidden="true" /> Add New User
            </>
          )}
        </motion.button>
      </div>

      {/* Add User Form */}
      <AnimatePresence>
        {isAddingUser && (
          <motion.div
            className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-6 mb-6 shadow-[0_4px_12px_rgba(106,13,173,0.3)] text-[#6A0DAD]"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="form"
            aria-labelledby="add-user-form-title"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 id="add-user-form-title" className="text-xl font-bold">
                Add New User
              </h2>
              <button
                onClick={toggleAddUserForm}
                className="text-[#6A0DAD] hover:text-[#7B17C0]"
                aria-label="Close add user form"
              >
                <FiX size={24} aria-hidden="true" />
              </button>
            </div>
            {error && <p className="text-red-500 mb-4" role="alert">{error}</p>}
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  Name
                </label>
                <input
                  id="name"
                  {...register("name")}
                  className="input input-bordered w-full bg-white text-[#6A0DAD]"
                  placeholder="Enter name"
                  aria-invalid={errors.name ? "true" : "false"}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm" role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  {...register("email")}
                  className="input input-bordered w-full bg-white text-[#6A0DAD]"
                  placeholder="Enter email"
                  type="email"
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium">
                  Phone Number
                </label>
                <input
                  id="phone"
                  {...register("phone")}
                  className="input input-bordered w-full bg-white text-[#6A0DAD]"
                  placeholder="Enter phone number"
                  aria-invalid={errors.phone ? "true" : "false"}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm" role="alert">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  {...register("password")}
                  className="input input-bordered w-full bg-white text-[#6A0DAD]"
                  placeholder="Enter password"
                  type="password"
                  aria-invalid={errors.password ? "true" : "false"}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium">
                  Role
                </label>
                <select
                  id="role"
                  {...register("role")}
                  className="select select-bordered w-full bg-white text-[#6A0DAD]"
                  aria-invalid={errors.role ? "true" : "false"}
                >
                  <option value="Admin">Admin</option>
                  <option value="Organizer">Organizer</option>
                  <option value="Staff">Staff</option>
                </select>
                {errors.role && (
                  <p className="text-red-500 text-sm" role="alert">
                    {errors.role.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="profileImage" className="block text-sm font-medium">
                  Profile Image
                </label>
                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input file-input-bordered w-full bg-white text-[#6A0DAD]"
                  aria-invalid={errors.profileImage ? "true" : "false"}
                />
                {errors.profileImage && (
                  <p className="text-red-500 text-sm" role="alert">
                    {errors.profileImage.message}
                  </p>
                )}
              </div>
              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD] disabled:opacity-50"
                  aria-label={isSubmitting ? "Saving user" : "Save user"}
                >
                  {isSubmitting ? "Saving..." : "Save User"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toggleAddUserForm();
                    reset();
                    setError(null);
                  }}
                  className="btn bg-gray-500 text-white hover:bg-gray-600"
                  aria-label="Cancel adding user"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Input */}
      <div className="flex-1 px-8 hidden md:flex justify-center pb-10">
        <input
          type="text"
          placeholder="Search..."
          className="input input-bordered w-full max-w-md bg-[rgba(255,255,255,0.2)] placeholder-gray-700 text-[#6A0DAD] border-[rgba(255,215,0,0.4)] backdrop-blur-sm shadow-sm"
          onChange={(e) => debouncedSetSearchQuery(e.target.value)}
          aria-label="Search users"
        />
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div
            className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#6A0DAD]"
            role="status"
            aria-label="Loading users"
          ></div>
        </div>
      ) : (
        <>
          {/* Empty State */}
          {paginatedUsers.length === 0 && (
            <div className="text-center py-10 text-[#6A0DAD]" role="alert">
              <p>No users found.</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { value: totalUsers, label: "Total Users" },
              { value: totalAdmins, label: "Total Admins" },
              { value: totalOrganizers, label: "Total Organizers" },
              { value: totalStaff, label: "Total Staff" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-4 shadow-[0_4px_12px_rgba(106,13,173,0.3)]"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                <p className="text-lg font-bold text-[#6A0DAD]">{stat.value}</p>
                <p className="text-sm text-[#6A0DAD] opacity-80">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Desktop: Table */}
          <div className="hidden md:block bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg shadow-[0_4px_12px_rgba(106,13,173,0.3)] overflow-hidden text-[#6A0DAD]">
            <table className="table w-full">
              <thead>
                <tr className="text-[#6A0DAD]">
                  <th>Profile</th>
                  {fields.map((field) => (
                    <th key={field}>
                      <button
                        onClick={() => handleSort(field)}
                        className="flex items-center gap-1 capitalize"
                      >
                        {field.replace("phoneNumber", "Phone")}
                        {sortField === field ? (
                          sortOrder === "asc" ? (
                            <FaSortAlphaUp aria-hidden="true" />
                          ) : (
                            <FaSortAlphaDown aria-hidden="true" />
                          )
                        ) : (
                          <FaSort aria-hidden="true" />
                        )}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    className={user.id === authUser?.uid ? "bg-[#FFD700]/20 border-l-4 border-[#6A0DAD]" : ""}
                    role="row"
                  >
                    <td>
                      <Image
                        src={user.photoURL || "/user.png"}
                        alt={`${user.name}'s profile picture`}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    </td>
                    <td>
                      <Link
                        href={`/users/${user.id}`}
                        className="text-[#6A0DAD] hover:underline"
                        aria-label={`View ${user.name}'s profile`}
                      >
                        {user.name}
                      </Link>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>{user.role}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: Cards */}
          <div className="md:hidden space-y-4">
            {paginatedUsers.map((user) => (
              <motion.div
                key={user.id}
                className={`bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-4 shadow-[0_4px_12px_rgba(106,13,173,0.3)] ${user.id === authUser?.uid ? "border-l-4 border-[#6A0DAD]" : ""
                  }`}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                role="article"
              >
                <Link href={`/users/${user.id}`} className="block" aria-label={`View ${user.name}'s profile`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Image
                      src={user.image || "/user.png"}
                      alt={`${user.name}'s profile picture`}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <p className="text-lg font-semibold text-[#6A0DAD]">{user.name}</p>
                  </div>
                  <p className="text-sm text-[#6A0DAD] opacity-80">Email: {user.email}</p>
                  <p className="text-sm text-[#6A0DAD] opacity-80">Phone: {user.phone}</p>
                  <p className="text-sm text-[#6A0DAD] opacity-80">Role: {user.role}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <div className="join" role="navigation" aria-label="Pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`join-item btn btn-sm bg-[#6A0DAD] text-[#FFD700] ${currentPage === page ? "btn-active" : ""
                    }`}
                  onClick={() => setCurrentPage(page)}
                  aria-label={`Go to page ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}