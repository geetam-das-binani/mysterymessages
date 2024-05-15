import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dayjs from 'dayjs';
import { X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ApiResponse, Messages } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
type MessageCardProps = {
  message: Messages;
  onMessageDelete: (messageId: string) => void;
};
const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
  const { toast } = useToast();
 
  
  const handleDeleteConfirm = async () => {
    onMessageDelete(message.id as string);
    try {
      const response = await axios.delete<ApiResponse>(
        `/api/delete-message?messageId=${message.id}`
      );
      if (response.data.success) {
        toast({
          title: response.data.message,
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ?? "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="card-bordered">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{message.content}</CardTitle>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <X className="w-5 h-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteConfirm}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="text-sm">
            {dayjs(message.createdAt).format('MMM D, YYYY h:mm A')}
          </div>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
    </>
  );
};

export default MessageCard;
