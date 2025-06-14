import { storage } from '@/lib/firebase';
import { zodResolver } from '@hookform/resolvers/zod';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { motion } from "framer-motion";

const sponsorSchema = z.object({
    sponsorName: z.string().min(1, "Name is required").max(100, "Name is too long"),
    sponsorLogo: z
        .union([z.instanceof(File), z.string().url().optional(), z.string().optional()])
        .optional()
        .nullable(),
})

type FormData = z.infer<typeof sponsorSchema>;

const AddSponsor = () => {
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
        resolver: zodResolver(sponsorSchema),
    })

    // Handle image upload
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                setValue("sponsorLogo", file);
            } catch (err) {
                setError("Failed to process image");
            }
        }
    };

    const onSubmit = async (data: FormData) => {
        try {
            let downloadUrl = "";

            if (data.sponsorLogo && data.sponsorLogo instanceof File) {
                const imageRef = ref(storage, `sponsor/${Date.now()}_${data.sponsorLogo.name}`);
                const snapshot = await uploadBytes(imageRef, data.sponsorLogo);
                downloadUrl = await getDownloadURL(snapshot.ref);
            }

            const response = await fetch("/api/sponsors", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    sponsorName: data.sponsorName,
                    sponsorLogo: downloadUrl,
                })
            })

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "Failed to create new Sponsor")
            }

            const newSponsor = await response.json();
            toast.success("Sponsor Added Successfully");
            reset();
            setError(null);
        } catch (err) {
            toast.error("Failed to Add Sponsor");
            setError(err instanceof Error ? err.message : "Failed to create Sponsor");
        }
    };

    return (
        <div>
            {/* New Sponsor */}
            <motion.div
                className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-6 mb-6 shadow-[0_4px_12px_rgba(106,13,173,0.3)] text-[#6A0DAD]"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                role="form"
                aria-labelledby="add-event-form-title">
                <h3 className="text-lg font-medium mb-2">Add New Sponsor</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="border p-4 mb-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium">
                                Sponsor Name
                            </label>
                            <input
                                id="name"
                                {...register('sponsorName', { required: 'Name is required' })}
                                className="input input-bordered w-full bg-white text-[#6A0DAD]"
                                placeholder="Enter sponsor name"
                                aria-invalid={errors.sponsorName ? 'true' : 'false'}
                            />
                            {errors.sponsorName && (
                                <p className="text-red-500 text-sm" role="alert">
                                    {errors.sponsorName.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="photo" className="block text-sm font-medium">
                                Sponsor Logo
                            </label>
                            <input
                                id="sponsorLogo"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="file-input file-input-bordered w-full bg-white text-[#6A0DAD]"
                                aria-invalid={errors.sponsorLogo ? 'true' : 'false'}
                            />
                            {errors.sponsorLogo && (
                                <p className="text-red-500 text-sm" role="alert">
                                    {errors.sponsorLogo.message}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="btn bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD] mt-4"
                        aria-label="Submit new sponsor"
                    >
                        Submit Sponsor
                    </button>
                </form>
            </motion.div>
        </div >
    )
}

export default AddSponsor
