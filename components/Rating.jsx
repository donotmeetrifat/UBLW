'use client'

import { StarIcon } from "@/components/icons";
import React from "react";

const Rating = ({ value = 5, size = 15 }) => {
    return (
        <div className="inline-flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
                <StarIcon
                    key={i}
                    size={size}
                    filled={value >= i + 1}
                    color="#D8B56D"
                    emptyColor="#E8DFE9"
                />
            ))}
        </div>
    );
};

export default Rating;
