'use client'
import LandingPage from "@/components/LandingPage";
import ResetPasswordContent from "@/components/resetpassword/ResetPasswordContent";

export default function HomePage() {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    if(accessToken) return(<ResetPasswordContent/>)
    return (<LandingPage/>);
}
