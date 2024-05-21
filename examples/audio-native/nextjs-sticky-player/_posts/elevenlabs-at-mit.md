---
title: "In focus: ElevenLabs at MIT EmTech Digital"
excerpt: "Enhancing AI safety through a focus on content provenance, traceability, and moderation"
coverImage: "/assets/blog/dynamic-routing/cover.jpg"
date: "2020-03-16T05:35:07.322Z"
author:
  name: ElevenLabs Team
  picture: "/assets/blog/authors/team.png"
ogImage:
  url: "/assets/blog/dynamic-routing/cover.jpg"
---

Last week at the MIT EmTech Digital conference in London, I participated in a panel focused on how business, government, and academia can collaborate to maximize opportunities and manage challenges associated with advanced AI products. Alongside ElevenLabs, the panel included leaders from the Alan Turing Institute, the Ada Lovelace Institute, and BT, with MIT Technology Review’s Melissa Heikkilä moderating the discussion.

Three-pronged approach to AI safety
At ElevenLabs, we develop audio AI technology conscious of its impact. In my role overseeing AI Safety, I’m focused on empowering creators, businesses and users, while preventing misuse and deterring bad actors. During the panel, I outlined the steps we’ve taken to make ElevenLabs a safer, more innovative space, and I advocated for the adoption of strategies that prioritize addressing AI safety challenges. These strategies include:

Provenance: involves distinguishing AI-generated content from real content by understanding its origins. Upstream AI detection tools, such as classifiers, are probabilistic models trained to recognize AI-generated outputs. At ElevenLabs, we’ve developed the AI Speech Classifier that lets anyone upload samples to check if they originate from our platform. We’re also collaborating with Loccus to enhance AI content classification capabilities. Classifiers, however, are not a panacea solution for provenance; they have their limitations. To address them, downstream AI detection methods have emerged, including metadata, watermarks, and fingerprinting solutions. We endorse industry-wide efforts such as cryptographically signed metadata standard C2PA, which present the benefit of being open and interoperable and could enable labeling of AI-generated content across main distribution channels like Instagram or Facebook.

Traceability: ensures that AI-generated content can be traced back to an individual user. At ElevenLabs, our systems let us link content generated on our platform to the originating account, and our voice cloning tools are accessible only to users who have verified their accounts with banking information. Focus on traceability ensures that anyone using AI platforms can be accountable for their actions, and identified by legal authorities when necessary.

Moderation: which involves defining clear policies on acceptable content and use, and preventing users from generating content that does not comply with such policies. At ElevenLabs, we use automated systems to scan, flag, and block inappropriate content. Human moderators review flagged content to ensure consistent policy enforcement. We are continually advancing our moderation technology to prevent the generation of content that could harm public trust or safety. Open source moderation endpoints, such as the one provided by OpenAI, enable easy integration of prompt moderation into any AI applications.
