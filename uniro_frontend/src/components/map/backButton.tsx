import { useNavigate } from "react-router";
import ChevronLeft from "../../../public/icons/chevron-left.svg?react";

interface BackButtonProps {
    className?: string;
    onClick?: () => void
}

export default function BackButton({ className = "", onClick }: BackButtonProps) {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/map');
    }

    return (
        <button className={`w-[52px] h-[52px] flex items-center justify-center border border-gray-400 rounded-full bg-gray-100 active:bg-gray-200 ${className}`} onClick={onClick ?? handleBack}>
            <ChevronLeft width={35} height={35} />
        </button>
    )
}
