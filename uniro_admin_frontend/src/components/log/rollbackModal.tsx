interface RollbackModalProps {
    rev: number;
    onRollback: () => void;
    onClose: () => void
}

export default function RollbackModal({ rev, onRollback, onClose }: RollbackModalProps) {
    return (
        <div className="w-screen h-screen absolute top-0 left-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)]">
            <div className="w-[300px] h-[300px] bg-gray-100 rounded-200 p-5 space-y-4 flex flex-col justify-center">
                <h2 className="font-bold text-xl "><i>{rev}</i> 로 되돌리시겠습니까?</h2>
                <p className="font-semibold">되돌리기 작업은 취소될 수 없습니다.</p>
                <div className="w-full flex justify-around ">
                    <button className="w-[100px] h-[30px] border border-gray-400 rounded-100 cursor-pointer text-primary-500" onClick={onRollback}>확인</button>
                    <button className="w-[100px] h-[30px] border border-gray-400 rounded-100 cursor-pointer text-system-red" onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    )
}