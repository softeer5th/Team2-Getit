interface TutorialModalProps {
    onClose: () => void;
    messages: string[];
}

export default function TutorialModal({ messages, onClose }: TutorialModalProps) {
    return (
        <div onClick={onClose} className='w-screen h-dvh flex items-center justify-center absolute top-0 bg-[rgba(0,0,0,0.5)] z-10 py-3 px-4'>
            {messages.map((message, idx) =>
                <p key={`route_tutorial_msg_${idx}`} className="text-gray-100 text-kor-body2 font-medium text-center">
                    {message}
                </p>
            )}
        </div>
    )
}
