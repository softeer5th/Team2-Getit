export default function FailModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="w-screen h-screen absolute top-0 left-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)]">
            <div className="w-[300px] h-[300px] bg-gray-100 rounded-200 p-5 space-y-4 flex flex-col justify-center">
                <h2 className="font-bold text-xl text-system-red ">에러가 발생하였습니다.</h2>
                <p className="font-semibold">관리자에게 문의바랍니다.</p>
                <div className="w-full flex justify-around ">
                    <button className="w-[100px] h-[30px] border border-gray-400 rounded-100 cursor-pointer text-system-red" onClick={onClose}>확인</button>
                </div>
            </div>
        </div>
    )
}
