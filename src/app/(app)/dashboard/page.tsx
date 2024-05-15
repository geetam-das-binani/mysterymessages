"use client";

import MessageCard from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import {
  AcceptMessage,
  AcceptMessageSchema,
} from "@/schemas/acceptMessagesSchema";
import { ApiResponse, Messages } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const page = () => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Messages[]>([]);
  const [isloading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const { toast } = useToast();
  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message.id !== messageId));
  };
  
  const { watch, register, handleSubmit, setValue } = useForm<AcceptMessage>({
    resolver: zodResolver(AcceptMessageSchema),
  });
  const acceptMessages = watch("acceptMessages");
  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages");

      setValue("acceptMessages", response.data.isAcceptingMessages as boolean);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;

      const response = axiosError?.response;

      if (response) {
        toast({
          title: "Error",
          description:
            response?.data?.message || "Failed to fetch message settings",
          variant: "destructive",
        });
      }
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);
  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      try {
        setIsLoading(true);
        setIsSwitchLoading(false);
        const response = await axios.get<ApiResponse>("/api/get-messages");
        console.log(response);

        if (response.data.success) {
          setMessages((response.data.messages as Messages[]) || []);
        }
        if (refresh) {
          toast({
            title: "Refreshed Messages",
            description: "Showing Latest Messages",
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;

        const response = axiosError?.response;

        if (response) {
          toast({
            title: "Error",
            description:
              response?.data?.message || "Failed to fetch message settings",
            variant: "destructive",
          });
        }
      } finally {
        setIsSwitchLoading(false);
        setIsLoading(false);
      }
    },
    [setIsLoading, setMessages]
  );
  useEffect(() => {
    if (!session?.user || !session) return;
    fetchAcceptMessages();
    fetchMessages();
  }, [session, setValue, fetchAcceptMessages, fetchMessages]);

  // handle switch change
  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: !acceptMessages,
      });
      if (response.data.success) {
        setValue("acceptMessages", !acceptMessages);
        toast({
          title: response.data.message,
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;

      const response = axiosError?.response;

      if (response) {
        toast({
          title: "Error",
          description:
            response?.data?.message || "Failed to update message settings",
          variant: "destructive",
        });
      }
    }
  };
  if (!session?.user || !session) return <div>Please Login</div>;
  const {username}=session?.user  as User
  // ** do more research on this
  const baseUrl=`${window.location.protocol}//${window.location.host}`
  const profileUrl = `${baseUrl}/u/${username}`
  const copyToClipboard = () => {
   window.navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Profile URL Copied",
      description: "Profile URL copied to clipboard",
    });
  }
  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{" "}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? "On" : "Off"}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isloading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={message.id}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
};

export default page;
