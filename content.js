const day = (day, focus, mission, sentences, words, type = "learn") => ({
  day, type, focus, mission,
  sentences: sentences.map(([text, meaning, tags], index) => ({ id: `d${day}s${index + 1}`, text, meaning, tags })),
  words: words.map(([word, meaning, example], index) => ({ id: `d${day}w${index + 1}`, word, meaning, example }))
});

window.GBME_CONTENT = {
  meta: { maxDay: 30, reviewEvery: 5 },
  days: [
    day(1, "Clear introductions", "처음 만난 동료에게 역할과 협업 목표를 소개해 보세요.", [
      ["I lead product operations and work closely with our regional teams.", "저는 제품 운영을 담당하며 각 지역 팀과 긴밀히 협업합니다.", ["introduction", "collaboration"]],
      ["My goal is to help the team make faster, better-informed decisions.", "제 목표는 팀이 더 빠르고 충분한 정보에 기반한 결정을 내리도록 돕는 것입니다.", ["introduction", "leadership"]]
    ], [["lead", "이끌다, 담당하다", "She leads the global launch."], ["closely", "긴밀하게", "We work closely with the finance team."], ["regional", "지역의", "Regional teams shared their feedback."], ["goal", "목표", "Our goal is to improve retention."], ["informed", "충분한 정보에 기반한", "We need an informed decision."]]),
    day(2, "Setting priorities", "이번 주의 우선순위와 그 이유를 간결하게 설명해 보세요.", [
      ["Our top priority this week is to finalize the launch plan.", "이번 주 최우선 과제는 출시 계획을 확정하는 것입니다.", ["planning", "priority"]],
      ["We should focus on the tasks that have the greatest customer impact.", "고객에게 가장 큰 영향을 주는 업무에 집중해야 합니다.", ["priority", "customer"]]
    ], [["priority", "우선순위", "Quality is our first priority."], ["finalize", "확정하다", "Let's finalize the agenda today."], ["focus", "집중하다", "We need to focus on delivery."], ["impact", "영향", "The change had a positive impact."], ["task", "업무, 과제", "I completed the urgent task."]]),
    day(3, "Sharing progress", "진행 상황과 남은 일을 수치나 일정과 함께 공유해 보세요.", [
      ["We have completed the initial research and are now reviewing the findings.", "초기 조사를 마쳤고 현재 결과를 검토하고 있습니다.", ["update", "research"]],
      ["We are on track to deliver the first draft by Friday.", "금요일까지 초안을 전달할 수 있도록 계획대로 진행 중입니다.", ["update", "timeline"]]
    ], [["complete", "완료하다", "We completed the first phase."], ["initial", "초기의", "The initial response was positive."], ["finding", "조사 결과", "The findings support our plan."], ["on track", "계획대로 진행 중인", "The project is on track."], ["draft", "초안", "Please review the draft."]]),
    day(4, "Asking for clarity", "모호한 요청을 정중하게 구체화해 보세요.", [
      ["Could you clarify what success would look like for this project?", "이 프로젝트에서 성공의 기준이 무엇인지 명확히 설명해 주시겠어요?", ["question", "alignment"]],
      ["To make sure I understand, is the deadline fixed or flexible?", "제가 정확히 이해했는지 확인하려는데, 마감일은 고정인가요 아니면 조정 가능한가요?", ["question", "timeline"]]
    ], [["clarify", "명확히 하다", "Could you clarify the scope?"], ["success", "성공", "How will we measure success?"], ["deadline", "마감일", "The deadline is next Monday."], ["fixed", "고정된", "The budget is fixed."], ["flexible", "조정 가능한", "Our schedule is flexible."]]),
    day(5, "Review: strong foundations", "Day 1–4의 핵심 표현을 소리 내어 말하고 자연스럽게 연결해 보세요.", [
      ["Our top priority is clear, and the project is on track.", "최우선 과제가 명확하며 프로젝트는 계획대로 진행 중입니다.", ["review", "progress"]],
      ["Could you clarify the deadline so we can finalize the plan?", "계획을 확정할 수 있도록 마감일을 명확히 해주시겠어요?", ["review", "alignment"]]
    ], [["priority", "우선순위", "Let's agree on the priority."], ["on track", "계획대로", "Delivery remains on track."], ["clarify", "명확히 하다", "Please clarify your request."], ["finalize", "확정하다", "We will finalize it tomorrow."], ["impact", "영향", "Consider the customer impact."]], "review"),
    day(6, "Running meetings", "회의 목적을 알리고 논의 순서를 자연스럽게 안내해 보세요.", [
      ["The purpose of today's meeting is to align on the next phase.", "오늘 회의의 목적은 다음 단계에 대해 의견을 맞추는 것입니다.", ["meeting", "alignment"]],
      ["Let's start with the key updates and then discuss any open questions.", "핵심 업데이트부터 시작한 뒤 남은 질문을 논의하겠습니다.", ["meeting", "facilitation"]]
    ], [["purpose", "목적", "The purpose is to share feedback."], ["align", "의견을 맞추다", "We need to align on scope."], ["phase", "단계", "The next phase starts soon."], ["update", "새 소식, 진행 상황", "Here is a quick update."], ["open question", "미해결 질문", "We have two open questions."]]),
    day(7, "Giving opinions", "의견과 근거를 공격적이지 않게 제시해 보세요.", [
      ["From my perspective, a phased rollout would reduce unnecessary risk.", "제 관점에서는 단계적 출시가 불필요한 위험을 줄일 것입니다.", ["opinion", "strategy"]],
      ["I believe this option offers the best balance of speed and quality.", "이 선택지가 속도와 품질 사이에서 가장 좋은 균형을 제공한다고 생각합니다.", ["opinion", "decision"]]
    ], [["perspective", "관점", "From a customer perspective, it is simple."], ["phased", "단계적인", "We chose a phased approach."], ["rollout", "출시, 도입", "The rollout begins in May."], ["balance", "균형", "We need a better balance."], ["option", "선택지", "This is the safest option."]]),
    day(8, "Professional disagreement", "상대의 의견을 인정하면서 다른 관점을 제시해 보세요.", [
      ["I see your point, but I interpret the data somewhat differently.", "말씀하신 요지는 이해하지만 저는 데이터를 조금 다르게 해석합니다.", ["disagreement", "data"]],
      ["That is a valid concern; however, we may be underestimating the opportunity.", "타당한 우려입니다. 다만 우리가 기회를 과소평가하고 있을 수 있습니다.", ["disagreement", "opportunity"]]
    ], [["interpret", "해석하다", "We interpret the results carefully."], ["somewhat", "다소", "The outcome was somewhat unexpected."], ["valid", "타당한", "That is a valid point."], ["concern", "우려", "I understand your concern."], ["underestimate", "과소평가하다", "Do not underestimate the effort."]]),
    day(9, "Making recommendations", "추천안과 기대 효과를 한 문장으로 연결해 보세요.", [
      ["I recommend testing the concept with a small group of customers first.", "먼저 소규모 고객 그룹을 대상으로 콘셉트를 시험해 볼 것을 권합니다.", ["recommendation", "customer"]],
      ["This approach would allow us to learn quickly before making a larger investment.", "이 접근법은 더 큰 투자를 하기 전에 빠르게 학습할 수 있게 합니다.", ["recommendation", "investment"]]
    ], [["recommend", "추천하다", "We recommend a pilot program."], ["concept", "구상, 콘셉트", "Customers liked the concept."], ["approach", "접근법", "We need a practical approach."], ["allow", "가능하게 하다", "This allows us to move faster."], ["investment", "투자", "The investment requires approval."]]),
    day(10, "Review: meeting confidence", "Day 6–9 표현으로 1분짜리 가상 회의를 진행해 보세요.", [
      ["I see your point, and I recommend a phased rollout to manage the risk.", "말씀하신 요지를 이해하며, 위험 관리를 위해 단계적 출시를 권합니다.", ["review", "meeting"]],
      ["Let's align on the approach before we move to the next phase.", "다음 단계로 넘어가기 전에 접근법에 대해 의견을 맞춥시다.", ["review", "alignment"]]
    ], [["align", "의견을 맞추다", "Let's align before Friday."], ["perspective", "관점", "I value your perspective."], ["valid", "타당한", "Your concern is valid."], ["recommend", "추천하다", "I recommend option two."], ["rollout", "출시, 도입", "The rollout was successful."]], "review"),
    day(11, "Email requests", "요청의 배경과 기한을 정중한 이메일 문장으로 써 보세요.", [
      ["Could you please share your feedback by the end of Thursday?", "목요일 업무 종료 전까지 피드백을 공유해 주시겠어요?", ["email", "request"]],
      ["For context, we need your input before the leadership review.", "참고로 경영진 검토 전에 의견이 필요합니다.", ["email", "context"]]
    ], [["feedback", "피드백", "Thank you for your feedback."], ["by the end of", "~가 끝날 때까지", "Please reply by the end of today."], ["context", "배경, 맥락", "Let me provide some context."], ["input", "의견, 정보", "We need legal input."], ["review", "검토", "The review is scheduled for Friday."]]),
    day(12, "Managing deadlines", "일정 위험을 조기에 알리고 현실적인 대안을 제시해 보세요.", [
      ["There is a risk that we may miss the original deadline.", "원래 마감일을 놓칠 위험이 있습니다.", ["timeline", "risk"]],
      ["We can protect quality by moving the delivery date back by two days.", "납품일을 이틀 늦추면 품질을 지킬 수 있습니다.", ["timeline", "solution"]]
    ], [["risk", "위험", "We identified a delivery risk."], ["miss", "놓치다", "We may miss the deadline."], ["original", "원래의", "The original plan changed."], ["protect", "보호하다", "This protects product quality."], ["move back", "뒤로 미루다", "Can we move the meeting back?"]]),
    day(13, "Delegating clearly", "업무·담당자·기한을 명확하게 합의해 보세요.", [
      ["Could you take ownership of the customer analysis?", "고객 분석을 맡아 주시겠어요?", ["delegation", "ownership"]],
      ["Please let me know by Wednesday if you need any additional support.", "추가 지원이 필요하면 수요일까지 알려 주세요.", ["delegation", "support"]]
    ], [["ownership", "책임, 주도권", "She took ownership of the issue."], ["analysis", "분석", "The analysis is nearly complete."], ["additional", "추가의", "We need additional resources."], ["support", "지원", "Thank you for your support."], ["take on", "맡다", "Can you take on this task?"]]),
    day(14, "Giving feedback", "관찰한 점과 개선 제안을 구체적으로 전달해 보세요.", [
      ["The presentation was clear and the customer examples were especially helpful.", "발표가 명확했고 특히 고객 사례가 도움이 되었습니다.", ["feedback", "presentation"]],
      ["One suggestion would be to simplify the final slide.", "한 가지 제안은 마지막 슬라이드를 단순화하는 것입니다.", ["feedback", "suggestion"]]
    ], [["especially", "특히", "The summary was especially useful."], ["helpful", "도움이 되는", "Your comments were helpful."], ["suggestion", "제안", "I have one suggestion."], ["simplify", "단순화하다", "Let's simplify the process."], ["specific", "구체적인", "Please be more specific."]]),
    day(15, "Review: clear collaboration", "Day 11–14의 요청·일정·피드백 표현을 한 업무 상황에 적용해 보세요.", [
      ["Could you take ownership of the analysis and share it by Thursday?", "분석을 맡아서 목요일까지 공유해 주시겠어요?", ["review", "delegation"]],
      ["Your draft is clear; one suggestion would be to simplify the summary.", "초안이 명확합니다. 한 가지 제안은 요약을 단순화하는 것입니다.", ["review", "feedback"]]
    ], [["feedback", "피드백", "Please share honest feedback."], ["deadline", "마감일", "We agreed on the deadline."], ["ownership", "책임", "Clear ownership saves time."], ["support", "지원", "Let us know if you need support."], ["simplify", "단순화하다", "We simplified the message."]], "review"),
    day(16, "Presenting data", "수치가 보여주는 변화와 한계를 함께 설명해 보세요.", [
      ["Revenue increased by twelve percent compared with the previous quarter.", "매출은 이전 분기 대비 12퍼센트 증가했습니다.", ["data", "finance"]],
      ["The results are encouraging, although the sample size remains limited.", "결과는 고무적이지만 표본 규모는 여전히 제한적입니다.", ["data", "caution"]]
    ], [["revenue", "매출", "Revenue grew steadily."], ["increase", "증가하다", "Demand increased in June."], ["compared with", "~와 비교하여", "Sales improved compared with last year."], ["encouraging", "고무적인", "The early results are encouraging."], ["sample size", "표본 크기", "The sample size is small."]]),
    day(17, "Explaining causes", "결과의 원인을 단정하지 않고 논리적으로 설명해 보세요.", [
      ["The decline appears to be driven mainly by lower demand in Europe.", "감소는 주로 유럽의 수요 하락에서 비롯된 것으로 보입니다.", ["analysis", "market"]],
      ["Several factors may have contributed to the change.", "여러 요인이 그 변화에 영향을 주었을 수 있습니다.", ["analysis", "cause"]]
    ], [["decline", "감소", "We saw a slight decline."], ["appear", "~인 것으로 보이다", "Demand appears stable."], ["drive", "야기하다", "Growth was driven by Asia."], ["factor", "요인", "Cost is an important factor."], ["contribute", "기여하다, 영향을 주다", "Timing contributed to the result."]]),
    day(18, "Discussing trade-offs", "두 선택지의 장단점을 균형 있게 비교해 보세요.", [
      ["The faster option saves time but requires more resources upfront.", "더 빠른 선택지는 시간을 절약하지만 초기에 더 많은 자원이 필요합니다.", ["decision", "trade-off"]],
      ["We need to weigh the short-term cost against the long-term benefit.", "단기 비용과 장기 이점을 비교해 판단해야 합니다.", ["decision", "finance"]]
    ], [["require", "필요로 하다", "The task requires careful planning."], ["upfront", "초기에, 선불로", "There is an upfront cost."], ["weigh", "비교하여 판단하다", "We should weigh both options."], ["short-term", "단기의", "The short-term impact is limited."], ["long-term", "장기의", "We need a long-term plan."]]),
    day(19, "Decision making", "결정 사항과 그 후속 조치를 명확하게 정리해 보세요.", [
      ["We have decided to proceed with the second option.", "두 번째 선택지로 진행하기로 결정했습니다.", ["decision", "action"]],
      ["The next step is to confirm the budget and assign an owner.", "다음 단계는 예산을 확정하고 담당자를 지정하는 것입니다.", ["decision", "next-step"]]
    ], [["decide", "결정하다", "We decided to proceed."], ["proceed", "진행하다", "Can we proceed as planned?"], ["confirm", "확정하다", "Please confirm the budget."], ["assign", "배정하다", "We assigned an owner."], ["owner", "담당자", "Who is the project owner?"]]),
    day(20, "Review: data to decisions", "Day 16–19의 데이터·원인·결정 표현으로 짧은 보고를 완성해 보세요.", [
      ["The results are encouraging, but we need to weigh the cost against the benefit.", "결과는 고무적이지만 비용과 이점을 비교해 판단해야 합니다.", ["review", "analysis"]],
      ["We have decided to proceed, and the next step is to confirm the budget.", "진행하기로 결정했으며 다음 단계는 예산 확정입니다.", ["review", "decision"]]
    ], [["revenue", "매출", "Revenue exceeded the target."], ["factor", "요인", "Timing was a key factor."], ["weigh", "비교하여 판단하다", "Let's weigh the risks."], ["proceed", "진행하다", "We are ready to proceed."], ["confirm", "확정하다", "Confirm the next steps."]], "review"),
    day(21, "Negotiating scope", "핵심 목표를 지키면서 범위를 조정하는 표현을 연습하세요.", [
      ["We can meet the deadline if we reduce the scope of the first release.", "첫 출시 범위를 줄이면 마감일을 맞출 수 있습니다.", ["negotiation", "scope"]],
      ["Which features are essential, and which ones can wait until the next phase?", "어떤 기능이 필수이고 어떤 기능은 다음 단계까지 미룰 수 있나요?", ["negotiation", "priority"]]
    ], [["scope", "범위", "The scope has expanded."], ["release", "출시", "The release is scheduled for June."], ["feature", "기능", "Customers requested this feature."], ["essential", "필수적인", "Testing is essential."], ["wait", "미루다, 기다리다", "This item can wait."]]),
    day(22, "Handling problems", "문제·영향·대응책을 차분하게 공유해 보세요.", [
      ["We identified an issue that may affect a small number of users.", "소수 사용자에게 영향을 줄 수 있는 문제를 발견했습니다.", ["problem", "customer"]],
      ["The team is working on a fix, and we will provide another update tomorrow.", "팀이 수정 작업 중이며 내일 다시 진행 상황을 공유하겠습니다.", ["problem", "update"]]
    ], [["identify", "발견하다, 식별하다", "We identified the root cause."], ["issue", "문제", "The issue is under control."], ["affect", "영향을 주다", "This may affect delivery."], ["fix", "수정, 해결책", "The fix is ready."], ["provide", "제공하다", "We will provide an update."]]),
    day(23, "Customer conversations", "고객의 요구를 확인하고 다음 행동을 제안해 보세요.", [
      ["What is the most important outcome you hope to achieve?", "가장 중요하게 달성하고 싶은 결과는 무엇인가요?", ["customer", "discovery"]],
      ["Based on your needs, I suggest we begin with a short pilot.", "요구 사항을 바탕으로 짧은 파일럿부터 시작할 것을 제안합니다.", ["customer", "recommendation"]]
    ], [["outcome", "결과", "We achieved the desired outcome."], ["achieve", "달성하다", "The team achieved its goal."], ["based on", "~을 바탕으로", "The plan is based on research."], ["need", "요구, 필요", "We understand your needs."], ["pilot", "시험 운영", "The pilot starts next month."]]),
    day(24, "Cross-cultural teamwork", "시간대와 소통 방식의 차이를 배려하며 협업해 보세요.", [
      ["Let's choose a time that works reasonably well across all regions.", "모든 지역에 무리 없이 맞는 시간을 정합시다.", ["global", "collaboration"]],
      ["Please feel free to share a different view or ask for more context.", "다른 의견을 나누거나 추가 맥락을 요청해도 좋습니다.", ["global", "inclusion"]]
    ], [["reasonably", "합리적으로, 무리 없이", "The plan works reasonably well."], ["region", "지역", "Teams across all regions joined."], ["feel free to", "편하게 ~하다", "Feel free to ask questions."], ["view", "견해", "She shared a different view."], ["inclusive", "포용적인", "We want an inclusive culture."]]),
    day(25, "Review: solutions together", "Day 21–24 표현으로 문제 해결 대화를 역할극해 보세요.", [
      ["We can meet the deadline if we focus on the essential features.", "필수 기능에 집중하면 마감일을 맞출 수 있습니다.", ["review", "scope"]],
      ["Based on your needs, the team will provide an updated plan tomorrow.", "요구 사항을 바탕으로 팀이 내일 수정 계획을 제공하겠습니다.", ["review", "customer"]]
    ], [["scope", "범위", "We agreed on the scope."], ["essential", "필수적인", "Focus on essential work."], ["issue", "문제", "We resolved the issue."], ["outcome", "결과", "The outcome met expectations."], ["region", "지역", "Demand varies by region."]], "review"),
    day(26, "Leading change", "변화의 이유와 팀이 받을 지원을 함께 설명해 보세요.", [
      ["This change will help us serve customers more consistently across markets.", "이 변화는 여러 시장에서 고객에게 더 일관되게 서비스하도록 도울 것입니다.", ["change", "leadership"]],
      ["We will provide training and support throughout the transition.", "전환 과정 내내 교육과 지원을 제공하겠습니다.", ["change", "support"]]
    ], [["consistently", "일관되게", "We deliver consistently high quality."], ["market", "시장", "We operate in ten markets."], ["training", "교육", "Training begins next week."], ["throughout", "~내내", "We supported them throughout the project."], ["transition", "전환", "The transition will take time."]]),
    day(27, "Strategic thinking", "현재 상황을 장기 목표와 연결해 설명해 보세요.", [
      ["This initiative supports our long-term goal of entering new markets.", "이 계획은 신규 시장 진출이라는 장기 목표를 뒷받침합니다.", ["strategy", "growth"]],
      ["We should build capabilities that remain valuable as the business grows.", "사업이 성장해도 계속 가치 있는 역량을 구축해야 합니다.", ["strategy", "capability"]]
    ], [["initiative", "계획, 이니셔티브", "The initiative has strong support."], ["enter", "진입하다", "We plan to enter a new market."], ["capability", "역량", "We need stronger digital capabilities."], ["remain", "계속 ~이다", "Demand remains high."], ["valuable", "가치 있는", "The feedback was valuable."]]),
    day(28, "Executive summaries", "핵심 결론·근거·요청을 짧게 보고해 보세요.", [
      ["In summary, demand is strong and the main risk is execution capacity.", "요약하면 수요는 강하며 주요 위험은 실행 역량입니다.", ["executive", "summary"]],
      ["We are asking for approval to begin the pilot next month.", "다음 달 파일럿을 시작할 수 있도록 승인을 요청드립니다.", ["executive", "approval"]]
    ], [["in summary", "요약하면", "In summary, the plan is feasible."], ["demand", "수요", "Customer demand is increasing."], ["capacity", "수용력, 역량", "The team has limited capacity."], ["approval", "승인", "We received final approval."], ["begin", "시작하다", "The project will begin soon."]]),
    day(29, "Following up", "회의 후 결정 사항과 담당 업무를 명확히 남겨 보세요.", [
      ["As discussed, I have attached the revised plan for your review.", "논의한 대로 검토하실 수 있도록 수정 계획을 첨부했습니다.", ["follow-up", "email"]],
      ["Please let me know if I missed anything or if the next steps are unclear.", "빠진 내용이 있거나 다음 단계가 불명확하면 알려 주세요.", ["follow-up", "alignment"]]
    ], [["as discussed", "논의한 대로", "As discussed, we updated the plan."], ["attach", "첨부하다", "I attached the report."], ["revised", "수정된", "Please review the revised version."], ["miss", "빠뜨리다", "Did I miss anything?"], ["unclear", "불명확한", "The ownership remains unclear."]]),
    day(30, "Review: global business toolkit", "30일의 핵심 표현으로 업데이트·제안·후속 조치를 2분 안에 말해 보세요.", [
      ["In summary, we are on track, and I recommend proceeding with the pilot.", "요약하면 계획대로 진행 중이며 파일럿을 추진할 것을 권합니다.", ["review", "summary"]],
      ["As discussed, the next step is to confirm ownership and finalize the timeline.", "논의한 대로 다음 단계는 담당자를 확정하고 일정을 마무리하는 것입니다.", ["review", "action"]]
    ], [["on track", "계획대로", "The launch is on track."], ["recommend", "추천하다", "We recommend moving forward."], ["proceed", "진행하다", "Let's proceed with the pilot."], ["ownership", "책임", "We confirmed ownership."], ["finalize", "확정하다", "Finalize the timeline today."]], "review")
  ]
};
