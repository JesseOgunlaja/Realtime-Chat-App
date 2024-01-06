import { UserType } from "@/types/UserTypes";
import { UUID } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { redis } from "./redis";
import { containsEmoji } from "./utils";
import { UserJWTSchema } from "./zod";

export async function decodeJWT(jwt: string, client?: boolean) {
  try {
    const verified = await jwtVerify(
      jwt,
      new TextEncoder().encode(
        client ? process.env.NEXT_PUBLIC_SIGNING_KEY : process.env.SIGNING_KEY
      )
    );
    return verified;
  } catch (error) {
    return undefined;
  }
}

export async function signJWT(
  payload: Record<string, unknown>,
  duration: string | number
) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(duration)
    .sign(new TextEncoder().encode(process.env.NEXT_PUBLIC_SIGNING_KEY));
}

function customStringify(obj: UserType) {
  return JSON.stringify(obj, function (key, value) {
    if (key === "message" && typeof value === "string") {
      if (containsEmoji(JSON.stringify(value))) {
        return value.replace(/[\u007f-\uffff]/g, function (chr) {
          return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).slice(-4);
        });
      }
      return value;
    }
    return value;
  });
}

export async function checkSignedIn(
  requestOrToken: NextRequest | string,
  isApiEndpoint: boolean,
  plainToken?: boolean
): Promise<
  | boolean
  | { isSignedIn: boolean; user: UserType; key: UUID }
  | { isSignedIn: boolean }
> {
  const token = plainToken
    ? (requestOrToken as string)
    : (requestOrToken as NextRequest).cookies.get("token")?.value;
  if (token == undefined) {
    if (isApiEndpoint) return { isSignedIn: false };
    return false;
  }
  const decodedToken = await decodeJWT(token, false);
  if (decodedToken == undefined) {
    if (isApiEndpoint) return { isSignedIn: false };
    return false;
  }
  const decodedPayload = decodedToken.payload as z.infer<typeof UserJWTSchema>;
  if (UserJWTSchema.safeParse(decodedPayload).success === false) {
    if (isApiEndpoint) return { isSignedIn: false };
    return false;
  }
  const user = (await redis.hgetall(decodedPayload.key)) as
    | UserType
    | undefined;
  if (user == undefined) {
    if (isApiEndpoint) return { isSignedIn: false };
    return false;
  }
  if (user.uuid !== decodedPayload.uuid) {
    if (isApiEndpoint) return { isSignedIn: false };
    return false;
  }
  if (isApiEndpoint)
    return { isSignedIn: true, user: user, key: decodedPayload.key as UUID };
  return true;
}

export async function protectedRouteForwarder(request: NextRequest) {
  try {
    await redis.hset("db408003-c69c-493e-ad04-fc39e9febe27", {
      chats: [
        {
          id: "faa9dbb4-f3cb-4477-8139-694e08ece53c",
          messages: [
            {
              message: "What's up",
              timestamp: 1703522794447,
              fromYou: true,
              id: "9687f050-585e-4c4b-aeee-7196f1de6898",
            },
            {
              message: "nothing lol",
              timestamp: 1703523378462,
              fromYou: false,
              id: "bd85d4e6-b16f-493d-8796-c3f24ceaa288",
            },
            {
              message: "come online in discord",
              timestamp: 1703656870170,
              fromYou: false,
              id: "0b319fec-b330-414a-b520-f4ca7881ee0e",
            },
          ],
          withID: "0745929e-2036-4c78-a0aa-86efdac0f393",
          visible: true,
        },
        {
          id: "4536fc59-b980-4a56-8e63-3b3f6ee034f8",
          messages: [],
          withID: "d1050850-5ed8-40d3-a960-2f34ed43003a",
          visible: false,
        },
        {
          id: "66483c70-7774-4bc9-91de-7717e5b953d2",
          messages: [
            {
              message: "hey",
              timestamp: 1704216987941,
              fromYou: true,
              id: "6a069f91-62b1-4114-8a35-9c93624509ed",
            },
            {
              message: "what's up",
              timestamp: 1704216994534,
              fromYou: false,
              id: "9d350b34-f361-4fb5-84ec-768dc4c4f4d4",
            },
            {
              message: "not much",
              timestamp: 1704216996875,
              fromYou: true,
              id: "343088b1-1224-4496-97ff-7f69690301a9",
            },
            {
              message: "just chilling",
              timestamp: 1704217001417,
              fromYou: true,
              id: "1ab5bc3c-3f12-4c8f-9c11-ce5dafebe2ad",
            },
            {
              message: "hbu?",
              timestamp: 1704217006001,
              fromYou: true,
              id: "4c5128f8-3e22-421c-ba73-265ef3bf9898",
            },
            {
              message: "same old",
              timestamp: 1704217009700,
              fromYou: false,
              id: "28e292c2-2845-42e7-be06-1cb62e818529",
            },
            {
              message: "fairs",
              timestamp: 1704217736315,
              fromYou: true,
              id: "0f0d771e-5950-434b-8e87-11c2fa9d3ebd",
            },
          ],
          withID: "d51d69aa-4605-414e-ba46-2fd875437a04",
          visible: true,
        },
        {
          id: "87bf0c54-2537-4276-96d5-d5c937abfda6",
          messages: [
            {
              message: "hey",
              timestamp: 1704490334745,
              fromYou: false,
              id: "d63d7f0a-0d4f-468c-8bed-888c8a809df3",
            },
            {
              message: "what's up bro",
              timestamp: 1704490342485,
              fromYou: true,
              id: "50d01857-28cb-4a6a-b667-23d4aafa2ba2",
            },
            {
              message: "nothing much",
              timestamp: 1704490347629,
              fromYou: false,
              id: "69466648-3aa5-4380-9219-e662ac6afde8",
            },
            {
              message: "just chilling",
              timestamp: 1704490352006,
              fromYou: false,
              id: "6b531dbb-49d3-4046-87cd-0af4f062fd65",
            },
            {
              message: "you know how it is",
              timestamp: 1704490354765,
              fromYou: false,
              id: "8d17782f-6440-4ca5-a0da-b0a7d06aa023",
            },
            {
              message: "fair enough",
              replyID: "8d17782f-6440-4ca5-a0da-b0a7d06aa023",
              timestamp: 1704490357412,
              fromYou: true,
              id: "b71b0eb1-3c6c-4e5f-8a51-6174dda096f2",
            },
            {
              message: "hbu?",
              timestamp: 1704490402844,
              fromYou: false,
              id: "a86593be-8abf-4cc2-a73b-8bc477d72b77",
            },
            {
              message: "just coding",
              timestamp: 1704490406463,
              fromYou: true,
              id: "efadf174-748c-4a66-9ae3-5ffe20b7e3b0",
            },
            {
              message: "these websites won't make themselves",
              timestamp: 1704490414497,
              fromYou: true,
              id: "0f832f96-6a0f-497e-9d15-a150ae0333db",
            },
            {
              message: "lol",
              replyID: "0f832f96-6a0f-497e-9d15-a150ae0333db",
              timestamp: 1704490417577,
              fromYou: false,
              id: "9d713c8c-caa1-48f0-bbbf-7d090242a7f3",
            },
            {
              message: "respect the grind",
              timestamp: 1704490420145,
              fromYou: false,
              id: "ca507909-d1e7-48dc-bd4a-55242bb39663",
            },
          ],
          withID: "78bd4036-6845-4bb5-8e87-efee7ebfea91",
          visible: true,
        },
      ],
    });
    const result = (await checkSignedIn(request, true)) as {
      isSignedIn: boolean;
      user: UserType;
      key: UUID;
    };
    if (!result.isSignedIn)
      return NextResponse.json({ message: "Unauthorised" }, { status: 401 });
    const requestHeaders = new Headers(request.headers);

    requestHeaders.set("user", customStringify(result.user));
    requestHeaders.set("key", JSON.stringify(result.key));
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: `${err}` }, { status: 500 });
  }
}
