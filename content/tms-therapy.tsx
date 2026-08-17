import Link from "next/link";
import CountUp from "@/components/count-up";
import type { TocItem } from "@/components/article-aside";
import { CONTACT } from "@/lib/site";

export const toc: TocItem[] = [
  { id: "what-is-tms", label: "What Is TMS Therapy?" },
  { id: "how-it-works", label: "How TMS Works" },
  { id: "who-qualifies", label: "Who Qualifies for TMS?" },
  { id: "what-to-expect", label: "What to Expect During Treatment" },
  { id: "tms-vs-meds", label: "TMS vs. Antidepressant Medication" },
  { id: "outcomes", label: "Outcomes and Success Rates" },
  { id: "at-graceland", label: "TMS at Graceland Psychiatry" },
];

export default function TmsTherapyArticle() {
  return (
    <>
      <p className="lede">
        For the millions of patients whose depression hasn&rsquo;t responded to antidepressants,
        Transcranial Magnetic Stimulation offers a clinically proven, non-invasive path forward.
      </p>

      <h2 id="what-is-tms">What Is TMS Therapy?</h2>
      <p>
        Transcranial Magnetic Stimulation, or TMS, is an FDA-cleared, non-invasive brain stimulation
        treatment for major depressive disorder (MDD), obsessive-compulsive disorder, and certain
        other psychiatric conditions. It uses precisely targeted magnetic pulses — similar in
        strength to those used in an MRI machine — to stimulate the nerve cells in the areas of the
        brain associated with mood and depression.
      </p>
      <p>
        Unlike electroconvulsive therapy (ECT), TMS requires no anesthesia, causes no seizure, and
        has no effect on memory or cognition. Patients remain fully awake and can sit up during a
        session and drive themselves home immediately afterward.
      </p>
      <p>
        First cleared by the FDA in 2008 for treatment-resistant depression, TMS has since
        accumulated years of clinical evidence and has been administered to hundreds of thousands of
        patients worldwide. At Graceland Psychiatry we offer NeuroStar Advanced TMS — the most
        clinically studied TMS system available today.
      </p>

      <div className="fact-box">
        <h4>Key facts about TMS</h4>
        <dl className="fact-grid">
          <div>
            <dt>FDA-Cleared</dt>
            <dd>Since 2008 for treatment-resistant depression</dd>
          </div>
          <div>
            <dt>~63%</dt>
            <dd>of patients experience a clinically meaningful response</dd>
          </div>
          <div>
            <dt>Zero</dt>
            <dd>systemic side effects — no weight gain or sexual dysfunction</dd>
          </div>
          <div>
            <dt>20–40 min</dt>
            <dd>per session, five days a week</dd>
          </div>
        </dl>
      </div>

      <h2 id="how-it-works">How TMS Works</h2>
      <p>
        The prefrontal cortex — the region of the brain most closely associated with regulating mood
        — is often significantly underactive in people experiencing major depression.
        Antidepressants attempt to correct this by altering brain chemistry systemically, which is
        why they affect the entire body and produce a wide range of side effects.
      </p>
      <p>
        TMS takes a fundamentally different approach. A small electromagnetic coil is placed against
        the scalp, directly over the left dorsolateral prefrontal cortex. Each magnetic pulse
        generates a small electric current in the targeted brain tissue, activating those neurons —
        essentially waking up an underactive circuit.
      </p>
      <p>
        Over the course of a full treatment course, typically 36 sessions delivered over six to nine
        weeks, these repeated activations create lasting neuroplastic changes. The brain literally
        rewires itself toward healthier patterns of activity. That is the key piece of why TMS
        results outlast the treatment course itself — it is a structural change, not a temporary
        chemical fix.
      </p>

      <blockquote className="pullquote">
        <p>
          &ldquo;TMS does not put chemicals into your body. It teaches your brain to regulate itself
          again — and that change tends to last.&rdquo;
        </p>
        <cite>— Dr. Femi Popoola, MD, MS, Graceland Psychiatry</cite>
      </blockquote>

      <h2 id="who-qualifies">Who Qualifies for TMS?</h2>
      <p>
        TMS is primarily indicated for patients with major depressive disorder who have tried at
        least one antidepressant without achieving adequate relief — a condition known as
        treatment-resistant depression. Approximately one in three people with depression falls into
        this category.
      </p>
      <p>Most candidates generally include patients who:</p>
      <ul>
        <li>Have been diagnosed with major depressive disorder (MDD)</li>
        <li>Have not responded adequately to one or more antidepressants</li>
        <li>Have experienced intolerable side effects from medications</li>
        <li>Prefer a non-medication approach for personal, occupational, or health reasons</li>
        <li>Are pregnant or planning pregnancy and want to avoid systemic drug exposure</li>
        <li>Have a co-occurring anxiety disorder alongside depression</li>
      </ul>
      <p>
        TMS is generally not appropriate for patients with implanted metal devices in or near the
        head (such as cochlear implants, deep brain stimulators, or certain aneurysm clips), or for
        those with a history of epilepsy or seizure disorders. A thorough evaluation with our
        clinical team will confirm your candidacy.
      </p>

      <h2 id="what-to-expect">What to Expect During Treatment</h2>
      <p>
        Every TMS course at Graceland Psychiatry begins with a comprehensive psychiatric evaluation
        to confirm your diagnosis, review your treatment history, and determine the optimal
        treatment parameters for your brain.
      </p>

      <div className="steps">
        <div className="step">
          <div>
            <h4>Mapping Session</h4>
            <p>
              Your first appointment determines your motor threshold — the minimum energy needed to
              produce a small motor twitch. This ensures every session delivers the exact right dose
              for your brain, not a generic setting.
            </p>
          </div>
        </div>
        <div className="step">
          <div>
            <h4>Daily Treatment Sessions</h4>
            <p>
              Sessions run 20–40 minutes, five days a week, for six to nine weeks. You sit in a
              comfortable reclining chair. You will hear clicking sounds and feel a gentle tapping
              sensation on your scalp. Most patients read, watch a show, or simply rest.
            </p>
          </div>
        </div>
        <div className="step">
          <div>
            <h4>Ongoing Monitoring</h4>
            <p>
              Our clinical team checks in with you regularly throughout the course of treatment,
              adjusting parameters if needed and monitoring your response using standardized
              depression rating scales.
            </p>
          </div>
        </div>
        <div className="step">
          <div>
            <h4>Completion and Maintenance</h4>
            <p>
              Most patients notice improvement within the first three to four weeks. After your full
              course, we work with you to create a maintenance plan — which may include occasional
              booster sessions — to sustain your results long-term.
            </p>
          </div>
        </div>
      </div>

      <h2 id="tms-vs-meds">TMS vs. Antidepressant Medication</h2>
      <p>
        For many patients, the most compelling aspect of TMS is what it does not do. Antidepressants
        work systemically — they affect the entire body, which is why they can cause weight gain,
        sexual dysfunction, emotional blunting, gastrointestinal disturbance, and drowsiness.
        Stopping them often requires a careful taper to avoid withdrawal effects.
      </p>

      <div className="table-wrap">
        <table className="compare">
          <thead>
            <tr>
              <th scope="col">Factor</th>
              <th scope="col">TMS Therapy</th>
              <th scope="col">Antidepressants</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>How it works</td>
              <td>Targeted magnetic stimulation of a specific brain region</td>
              <td>Systemic neurotransmitter modulation</td>
            </tr>
            <tr>
              <td>Systemic impact</td>
              <td>None — no effect on the rest of the body</td>
              <td>Whole body — affects most organ systems</td>
            </tr>
            <tr>
              <td>Common side effects</td>
              <td>Mild scalp discomfort, headache in the first week</td>
              <td>Weight gain, sexual dysfunction, fatigue, nausea</td>
            </tr>
            <tr>
              <td>Onset of relief</td>
              <td>2–4 weeks into treatment</td>
              <td>4–8 weeks after starting or adjusting</td>
            </tr>
            <tr>
              <td>Discontinuation</td>
              <td>None — treatment simply ends</td>
              <td>Taper required under supervision</td>
            </tr>
            <tr>
              <td>Long-term impact</td>
              <td>Neuroplastic changes tend to persist after the course ends</td>
              <td>Symptoms typically return when medication stops</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="outcomes">Outcomes and Success Rates</h2>
      <p>
        The clinical evidence for TMS in treatment-resistant depression is substantial. In the
        NeuroStar outcomes registry — the largest TMS dataset to date, covering more than 12,000
        patients who had already averaged several failed antidepressant trials:
      </p>

      <div className="stat-row">
        <div className="stat">
          <b>
            <CountUp value={83} suffix="%" />
          </b>
          <span>experienced a meaningful reduction in symptoms</span>
        </div>
        <div className="stat">
          <b>
            <CountUp value={62} suffix="%" />
          </b>
          <span>achieved a clinically significant response</span>
        </div>
        <div className="stat">
          <b>
            <CountUp value={68} suffix="%" />
          </b>
          <span>maintained response at 12-month follow-up</span>
        </div>
      </div>

      <p>
        It is worth noting that these results were achieved in patients who had already failed at
        least one antidepressant — a population traditionally considered &ldquo;hard to
        treat.&rdquo;
      </p>
      <p>
        It is equally important to set expectations honestly: TMS is not effective for everyone. A
        small subset of patients will see no response, or only a modest one. In those cases,
        alternative options — including Spravato (esketamine) or newer stimulation protocols — may
        be considered as an extension of the treatment plan, and we will discuss those with you at
        every step.
      </p>

      <blockquote className="pullquote">
        <p>
          &ldquo;Some of the most powerful moments in my career have been watching a patient who has
          been depressed for years walk in after their fourth week of TMS and say — for the first
          time in a long time — that they actually want to get out of bed in the morning.&rdquo;
        </p>
        <cite>— Dr. Femi Popoola, MD, MS</cite>
      </blockquote>

      <h2 id="at-graceland">TMS at Graceland Psychiatry</h2>
      <p>
        At Graceland Psychiatry, TMS is not an add-on service — it is a core pillar of our
        commitment to evidence-based, innovative psychiatric care. We operate NeuroStar Advanced TMS
        systems, the platform with the most clinical evidence behind it, including real-world data
        from millions of treatment sessions.
      </p>
      <p>
        Our TMS program is supervised directly by Dr. Popoola, a double board-certified psychiatrist
        who evaluates every patient personally before an initial course of treatment. You will never
        be handed off to a technician running a fixed protocol — your progress is monitored at every
        step, and your care plan is adjusted as needed.
      </p>
      <p>
        We work closely with most major insurance providers. Many plans — including Medicare and
        Medicaid — cover TMS for treatment-resistant depression when specific criteria are met. Our
        care coordinators will verify your benefits before you commit to a treatment plan.
      </p>

      <div className="inline-cta">
        <div>
          <span className="eyebrow" style={{ color: "#79D0F7" }}>
            Ready for the next step?
          </span>
          <h3>Schedule a Free Consultation</h3>
          <p>
            Our team will review your history, answer every question you have, and tell you honestly
            whether TMS is right for you — no obligation.
          </p>
        </div>
        <div className="actions">
          <a className="btn btn-primary" href={`tel:${CONTACT.phoneRaw}`}>
            📞 {CONTACT.phone}
          </a>
          <Link className="btn btn-ghost" href="/contact">
            Send a Message
          </Link>
        </div>
      </div>
    </>
  );
}
