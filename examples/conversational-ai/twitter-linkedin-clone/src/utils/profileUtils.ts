import { ProfileInfo } from "@/types/profile";

export const createProfileInfo = (
  username: string,
  platform: string
): ProfileInfo => ({
  type: platform as "twitter" | "linkedin",
  identifier: username,
  url:
    platform === "linkedin"
      ? `https://www.linkedin.com/in/${username}`
      : `https://x.com/${username}`,
  displayName: platform === "linkedin" ? username : `@${username}`,
});

export const getProfilePrompt = (profileInfo: ProfileInfo): string => {
  if (profileInfo.type === "linkedin") {
    return `Please provide an extremely comprehensive and detailed profile of the LinkedIn user at ${profileInfo.url}. This will be used to create an authentic representation, so be as thorough and specific as possible. Include:

PERSONAL & PROFESSIONAL IDENTITY:
1. Full name, current role, title, and company/organization
2. Professional background, career progression, and key achievements
3. Educational background, qualifications, and certifications
4. Geographic location and any relocation history
5. Years of experience and career timeline

EXPERTISE & KNOWLEDGE AREAS:
1. Primary areas of expertise and specialization
2. Technologies, tools, methodologies, and skills they work with
3. Industry insights and unique perspectives they share
4. Thought leadership topics and recurring themes
5. Professional accomplishments and recognitions

COMMUNICATION STYLE & PERSONALITY:
1. Typical tone in professional communications (formal, approachable, analytical, etc.)
2. How they present themselves professionally
3. Their approach to networking and professional relationships
4. Leadership style and management philosophy if applicable

CONTENT PATTERNS & INTERESTS:
1. Most frequent topics they discuss professionally
2. Types of content they share (articles, insights, career updates)
3. Industries, companies, or professionals they often mention
4. Current projects, initiatives, or focus areas

PROFESSIONAL NETWORK & RELATIONSHIPS:
1. Key collaborators, mentors, or frequent professional connections
2. Companies or organizations they're associated with
3. Events, conferences, or professional communities they're active in
4. Board positions, advisory roles, or volunteer work

CAREER INSIGHTS & OPINIONS:
1. Known viewpoints on industry trends or professional topics
2. Professional values and principles that come through in their profile
3. Challenges or experiences they've shared professionally
4. Goals, aspirations, or future plans they've mentioned

RECENT ACTIVITY & CONTEXT:
1. Latest projects, announcements, or career moves
2. Recent posts, articles, or professional engagement
3. Any trending professional topics they've weighed in on
4. Current focus areas or interests

Please make this as detailed and specific as possible, including exact quotes, specific examples, and concrete details that would help someone understand not just what they do, but HOW they think and communicate professionally. If certain information isn't available, please indicate that rather than speculating.`;
  } else {
    return `Please provide an extremely comprehensive and detailed profile of the Twitter/X user ${profileInfo.displayName} (${profileInfo.url}). This will be used to create an authentic representation, so be as thorough and specific as possible. Include:

PERSONAL & PROFESSIONAL IDENTITY:
1. Full name, current role, title, and company/organization
2. Professional background, career progression, and key achievements
3. Educational background and qualifications
4. Geographic location and any relocation history

EXPERTISE & KNOWLEDGE AREAS:
1. Primary areas of expertise and specialization
2. Technologies, tools, or methodologies they work with
3. Industry insights and unique perspectives they share
4. Thought leadership topics and recurring themes

COMMUNICATION STYLE & PERSONALITY:
1. Typical tone (professional, casual, humorous, analytical, etc.)
2. Common phrases, expressions, or vocabulary they use
3. How they structure their thoughts and arguments
4. Their approach to engaging with others online

CONTENT PATTERNS & INTERESTS:
1. Most frequent topics they discuss
2. Types of content they share (articles, opinions, personal updates)
3. Industries, companies, or people they often mention
4. Current projects, initiatives, or focus areas

PROFESSIONAL NETWORK & RELATIONSHIPS:
1. Key collaborators, mentors, or frequent interaction partners
2. Companies or organizations they're associated with
3. Events, conferences, or communities they're active in

PERSONAL INSIGHTS & OPINIONS:
1. Known viewpoints on industry trends or hot topics
2. Personal values and principles that come through in their posts
3. Challenges or experiences they've shared publicly
4. Goals, aspirations, or future plans they've mentioned

RECENT ACTIVITY & CONTEXT:
1. Latest projects, announcements, or career moves
2. Recent posts, threads, or engagement patterns
3. Any trending topics they've weighed in on
4. Current focus areas or interests

Please make this as detailed and specific as possible, including exact quotes, specific examples, and concrete details that would help someone understand not just what they do, but HOW they think and communicate. If certain information isn't available, please indicate that rather than speculating.`;
  }
};
