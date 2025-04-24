import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertFeedbackSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

type FeedbackFormValues = z.infer<typeof insertFeedbackSchema>;

const strengthOptions = [
  { id: "clear-explanations", label: "Clear Explanations" },
  { id: "knowledgeable", label: "Knowledgeable" },
  { id: "engaging", label: "Engaging" },
  { id: "well-prepared", label: "Well Prepared" },
  { id: "responsive", label: "Responsive" },
  { id: "practical-examples", label: "Practical Examples" },
];

const improvementOptions = [
  { id: "pacing", label: "Pacing" },
  { id: "content-depth", label: "Content Depth" },
  { id: "qa-time", label: "Q&A Time" },
  { id: "materials", label: "Materials" },
  { id: "interaction", label: "Interaction" },
  { id: "technical-issues", label: "Technical Issues" },
];

export function FeedbackForm({ sessionId: initialSessionId }: { sessionId?: number }) {
  const { toast } = useToast();
  const [ratingHover, setRatingHover] = useState<string | null>(null);

  // Fetch sessions data
  const { data: sessionsData, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["/api/sessions"],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Initialize the form
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(insertFeedbackSchema),
    defaultValues: {
      sessionId: initialSessionId || 0,
      overallRating: 0,
      knowledgeRating: 0,
      communicationRating: 0,
      materialsRating: 0,
      engagementRating: 0,
      comments: "",
      strengths: [],
      improvements: [],
    },
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: (data: FeedbackFormValues) => {
      return apiRequest("/api/feedback", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Feedback submitted successfully",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FeedbackFormValues) => {
    submitMutation.mutate(data);
  };

  if (isLoadingSessions) {
    return <div>Loading...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="sessionId"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Training Session</FormLabel>
                  <Select
                    value={field.value?.toString() || ""}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a training session" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessionsData?.map((session) => (
                        <SelectItem key={session.id} value={session.id.toString()}>
                          {session.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="overallRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Rating</FormLabel>
                    <StarRating
                      value={field.value}
                      onChange={field.onChange}
                      onHoverChange={setRatingHover}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="knowledgeRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Knowledge & Expertise</FormLabel>
                    <StarRating value={field.value} onChange={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="communicationRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Communication Skills</FormLabel>
                    <StarRating value={field.value} onChange={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="materialsRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Training Materials</FormLabel>
                    <StarRating value={field.value} onChange={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="engagementRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engagement & Interaction</FormLabel>
                    <StarRating value={field.value} onChange={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Additional Comments</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Share your thoughts..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="strengths"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Trainer's Strengths</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {strengthOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`strength-${option.id}`}
                          checked={field.value?.includes(option.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...(field.value || []), option.id]);
                            } else {
                              field.onChange(
                                field.value?.filter((value) => value !== option.id) || []
                              );
                            }
                          }}
                        />
                        <Label htmlFor={`strength-${option.id}`}>{option.label}</Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="improvements"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Areas for Improvement</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {improvementOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`improvement-${option.id}`}
                          checked={field.value?.includes(option.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...(field.value || []), option.id]);
                            } else {
                              field.onChange(
                                field.value?.filter((value) => value !== option.id) || []
                              );
                            }
                          }}
                        />
                        <Label htmlFor={`improvement-${option.id}`}>{option.label}</Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="reset" onClick={() => form.reset()}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitMutation.isPending}>
            {submitMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit Feedback
          </Button>
        </div>
      </form>
    </Form>
  );
}