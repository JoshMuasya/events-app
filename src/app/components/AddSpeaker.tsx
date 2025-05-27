import { storage } from '@/lib/firebase';
import { zodResolver } from '@hookform/resolvers/zod';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { motion } from "framer-motion";

const speakerSchema = z.object({
    speakerName: z.string().min(1, "Name is required").max(100, "Name is too long"),
    description: z.string().min(1, "Description is required"),
    profileImage: z
        .union([z.instanceof(File), z.string().url().optional(), z.string().optional()])
        .optional()
        .nullable(),
})

type FormData = z.infer<typeof speakerSchema>;

const AddSpeaker = () => {
    const [error, setError] = useState<string | null>(null);

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

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(speakerSchema),
    })

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

    const onSubmit = async (data: FormData) => {
        try {
            let downloadUrl = "";

            if (data.profileImage && data.profileImage instanceof File) {
                const imageRef = ref(storage, `speakers/${Date.now()}_${data.profileImage.name}`);
                const snapshot = await uploadBytes(imageRef, data.profileImage);
                downloadUrl = await getDownloadURL(snapshot.ref);
            }

            const response = await fetch("/api/speakers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    speakerName: data.speakerName,
                    description: data.description,
                    profileImage: downloadUrl,
                })
            })

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "Failed to create new Speaker")
            }

            const newSpeaker = await response.json();
            toast.success("Speaker Added Successfully");
            reset();
            setError(null);
        } catch (err) {
            toast.error("Failed to Add Speaker");
            setError(err instanceof Error ? err.message : "Failed to create speaker");
        }
    };

    return (
        <div>
            {/* New Speakers */}
            <motion.div
                className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-6 mb-6 shadow-[0_4px_12px_rgba(106,13,173,0.3)] text-[#6A0DAD]"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                role="form"
                aria-labelledby="add-event-form-title">
                <h3 className="text-lg font-medium mb-2">Add New Speaker</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="border p-4 mb-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium">
                                Name
                            </label>
                            <input
                                id="name"
                                {...register('speakerName', { required: 'Name is required' })}
                                className="input input-bordered w-full bg-white text-[#6A0DAD]"
                                placeholder="Enter speaker name"
                                aria-invalid={errors.speakerName ? 'true' : 'false'}
                            />
                            {errors.speakerName && (
                                <p className="text-red-500 text-sm" role="alert">
                                    {errors.speakerName.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="photo" className="block text-sm font-medium">
                                Profile Image
                            </label>
                            <input
                                id="profileImage"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="file-input file-input-bordered w-full bg-white text-[#6A0DAD]"
                                aria-invalid={errors.profileImage ? 'true' : 'false'}
                            />
                            {errors.profileImage && (
                                <p className="text-red-500 text-sm" role="alert">
                                    {errors.profileImage.message}
                                </p>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium">
                                Short Description
                            </label>
                            <textarea
                                id="description"
                                {...register('description', { required: 'Description is required' })}
                                className="textarea textarea-bordered w-full bg-white text-[#6A0DAD]"
                                placeholder="Enter short bio or description"
                                rows={3}
                                aria-invalid={errors.description ? 'true' : 'false'}
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm" role="alert">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="btn bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD] mt-4"
                        aria-label="Submit new speaker"
                    >
                        Submit Speaker
                    </button>
                </form>
            </motion.div>
        </div >
    )
}

export default AddSpeaker
