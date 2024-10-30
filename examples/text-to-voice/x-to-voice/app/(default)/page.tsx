import { VoiceGenForm } from "@/components/voice-generator-form";
import { FooterNav } from "@/components/footer-nav";

export default function Home() {
  return (
    <>
      <VoiceGenForm />
      <footer>
        <FooterNav className={"fixed bottom-0 left-0"}></FooterNav>
      </footer>
    </>
  );
}
