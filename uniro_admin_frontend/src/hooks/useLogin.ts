import { create } from "zustand";
import { universityRecord } from "../constant/university";

interface LoginProps {
  accessToken: string;
  setAccessToken: (newToken:string)=>void;
  isLogin: boolean;
  setIsLogin: (state:boolean)=>void;
}

const useLogin = create<LoginProps>((set) => ({
    accessToken: '',
    setAccessToken: (newToken: string)=>set(({accessToken: newToken})),
    isLogin: false,
    setIsLogin: (state: boolean)=>set(({isLogin: state})),
}));

export default useLogin;
