import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

const EmailTemplate = (props: any) => {
  const { agentId } = props;
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-[#151516] font-sans">
          <Container className="mx-auto my-[40px] p-[20px] max-w-[600px] bg-[#0a1929] rounded-[8px]">
            {/* Top Section */}
            <Section className="mt-[32px] mb-[32px] text-center">
              <Text className="text-[28px] font-bold text-[#9c27b0] m-0">
                Your Conversational AI agent is ready to chat!
              </Text>
            </Section>

            {/* Content Area with Icon */}
            <Section className="mb-[32px] text-center">
              {/* Circle Icon with Checkmark */}
              <div className="mx-auto mb-[24px] w-[80px] h-[80px] rounded-full bg-gradient-to-r from-[#9c27b0] to-[#3f51b5] flex items-center justify-center">
                <div className="text-[40px] text-white">✓</div>
              </div>

              {/* Descriptive Text */}
              <Text className="text-[18px] text-white mb-[24px]">
                Your Conversational AI agent is ready to chat!
              </Text>
            </Section>

            {/* Call to Action Button */}
            <Section className="mb-[32px] text-center">
              <Button
                href={`https://elevenlabs.io/app/talk-to?agent_id=${agentId}`}
                className="bg-[#9c27b0] text-white py-[20px] px-[40px] rounded-[8px] font-bold no-underline text-[24px] box-border"
              >
                Chat now!
              </Button>
            </Section>

            {/* Footer */}
            <Section className="mt-[40px] text-center border-t border-[#2d3748] pt-[20px]">
              <Text className="text-[14px] text-white m-0">
                Powered by{" "}
                <a
                  href="https://elevenlabs.io/conversational-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-400 transition-colors underline"
                >
                  ElevenLabs Conversational AI
                </a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export { EmailTemplate };
