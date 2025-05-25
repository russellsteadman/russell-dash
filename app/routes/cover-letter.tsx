import verifyToken from "~/shared/auth";
import type { Route } from "./+types/home";
import { useEffect, useState } from "react";
import localforage from "localforage";
import { useActionData } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cover Letter | Dash" },
    { name: "robots", content: "noindex" },
  ];
}

export async function action(args: Route.ActionArgs) {
  const auth = await verifyToken(args);

  if (!auth) {
    return new Response("Unauthorized", { status: 401 });
  }
  const formData = await args.request.formData();
  const resume = formData.get("resume") as string;
  const jobTitle = formData.get("jobTitle") as string;
  const companyName = formData.get("companyName") as string;
  const jobDescription = formData.get("jobDescription") as string;

  const AI = args.context.cloudflare.env.AI;

  // `Use the following resume, company name, job title, and job description to generate a cover letter. Do not add any other text.\n\nJob Title: ${jobTitle}\nCompany Name: ${companyName}\nJob Description: ${jobDescription}\n\nResume:\n${resume}`

  const result = await AI.run(
    "@cf/meta/llama-4-scout-17b-16e-instruct",
    {
      messages: [
        {
          role: "system",
          content:
            "You are a cover letter author that uses resumes and job posting information to write cover letters. Respond only with cover letters.",
        },
        {
          role: "user",
          content: `Job Title: ${jobTitle}\nCompany Name: ${companyName}\nJob Description: ${jobDescription}\n\nResume:\n${resume}`,
        },
      ],
      max_tokens: 2048,
    },
    {
      gateway: {
        id: "by-russell",
      },
    }
  );

  // if (result instanceof ReadableStream)
  //   return new Response("Unreadable stream", { status: 500 });

  const responseText = typeof result === "string" ? result : result.response;

  return { coverLetter: responseText };
}

export async function loader(args: Route.LoaderArgs) {
  const auth = await verifyToken(args);

  if (!auth) {
    return new Response("Unauthorized", { status: 401 });
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const actionData = useActionData<typeof action>();
  const [resume, setResume] = useState("");

  useEffect(() => {
    localforage.getItem("resume").then((value) => {
      if (value) {
        setResume(value as string);
      }
    });
  }, []);

  return (
    <form className="block" method="POST">
      <div className="max-w-2xl mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold">Cover Letter</h1>

        {/* Resume file element */}
        <div className="mt-4">
          <p className="text-lg">Resume:</p>
          <textarea
            rows={6}
            className="mt-2 p-2 border border-gray-300 rounded w-full"
            placeholder="Paste your resume here..."
            name="resume"
            autoComplete="off"
            value={resume}
            onChange={(e) => {
              setResume(e.target.value);
              localforage.setItem("resume", e.target.value);
            }}
          ></textarea>
        </div>

        {/* Company name element */}
        <div className="mt-4">
          <p className="text-lg">Company Name:</p>
          <input
            type="text"
            className="mt-2 p-2 border border-gray-300 rounded w-full"
            placeholder="Enter the company name here..."
            autoComplete="off"
            name="companyName"
          />
        </div>

        {/* Job title element */}
        <div className="mt-4">
          <p className="text-lg">Job Title:</p>
          <input
            type="text"
            className="mt-2 p-2 border border-gray-300 rounded w-full"
            placeholder="Enter the job title here..."
            autoComplete="off"
            name="jobTitle"
          />
        </div>

        {/* Job description element */}
        <div className="mt-4">
          <p className="text-lg">Job Description:</p>
          <textarea
            rows={6}
            className="mt-2 p-2 border border-gray-300 rounded w-full"
            placeholder="Paste the job description here..."
            name="jobDescription"
            autoComplete="off"
            autoFocus
          ></textarea>
        </div>

        {/* Generate button */}
        <div className="mt-6">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            type="submit"
          >
            Generate Cover Letter
          </button>
        </div>

        {actionData && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold">Generated Cover Letter</h2>
            <div className="mt-2 p-4 border border-gray-300 rounded bg-gray-50">
              <textarea
                rows={10}
                disabled
                className="w-full p-2 border border-gray-300 rounded bg-white"
                value={actionData.coverLetter}
              ></textarea>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
