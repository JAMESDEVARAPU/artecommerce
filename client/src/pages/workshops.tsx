import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, Users, Ticket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import type { Workshop } from "@shared/schema";

import workshopImage from "@assets/generated_images/adult_workshop_scene.png";

const bookingSchema = z.object({
  attendeeName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  numberOfSeats: z.coerce.number().min(1, "At least 1 seat required").max(10, "Maximum 10 seats per booking"),
});

type BookingForm = z.infer<typeof bookingSchema>;

function WorkshopCard({ workshop, isPast }: { workshop: Workshop; isPast?: boolean }) {
  const [showBooking, setShowBooking] = useState(false);
  const { toast } = useToast();
  const seatsLeft = (workshop.maxSeats || 20) - (workshop.bookedSeats || 0);
  const workshopDate = new Date(workshop.date);

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      attendeeName: "",
      email: "",
      phone: "",
      numberOfSeats: 1,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: BookingForm) => {
      const response = await apiRequest("POST", "/api/workshop-bookings", {
        ...data,
        workshopId: workshop.id,
        paymentStatus: "pending",
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Booking confirmed!",
        description: "Your seats have been reserved. Check your email for details.",
      });
      setShowBooking(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/workshops"] });
    },
    onError: () => {
      toast({
        title: "Booking failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingForm) => {
    if (data.numberOfSeats > seatsLeft) {
      toast({
        title: "Not enough seats",
        description: `Only ${seatsLeft} seats available.`,
        variant: "destructive",
      });
      return;
    }
    mutation.mutate(data);
  };

  const totalPrice = parseFloat(workshop.price) * (form.watch("numberOfSeats") || 1);

  return (
    <>
      <Card
        className={`overflow-hidden ${isPast ? "opacity-75" : ""}`}
        data-testid={`card-workshop-${workshop.id}`}
      >
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 aspect-video md:aspect-auto bg-muted relative">
            {workshop.imageUrl ? (
              <img
                src={workshop.imageUrl}
                alt={workshop.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={workshopImage}
                alt={workshop.title}
                className="w-full h-full object-cover"
              />
            )}
            {isPast && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                <Badge variant="secondary">Past Workshop</Badge>
              </div>
            )}
          </div>
          <CardContent className="flex-1 p-6">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
              <div>
                <h3 className="font-display text-xl font-medium mb-2">
                  {workshop.title}
                </h3>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(workshopDate, "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{workshop.time} ({workshop.duration})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{workshop.venue}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-primary font-accent text-xl font-semibold">
                  ₹{parseFloat(workshop.price).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">per person</p>
              </div>
            </div>

            <p className="text-muted-foreground mb-4 leading-relaxed">
              {workshop.description}
            </p>

            {!isPast && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                  <span className={seatsLeft <= 5 ? "text-destructive" : "text-muted-foreground"}>
                    {seatsLeft > 0 ? `${seatsLeft} seats available` : "Sold out"}
                  </span>
                </div>
                <Button
                  onClick={() => setShowBooking(true)}
                  disabled={seatsLeft <= 0}
                  data-testid={`button-book-workshop-${workshop.id}`}
                >
                  {seatsLeft > 0 ? "Book Now" : "Sold Out"}
                </Button>
              </div>
            )}
          </CardContent>
        </div>
      </Card>

      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Book Workshop
            </DialogTitle>
            <DialogDescription>
              Reserve your spot for "{workshop.title}"
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="attendeeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} data-testid="input-booking-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} data-testid="input-booking-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} data-testid="input-booking-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numberOfSeats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Seats (max {seatsLeft})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={Math.min(10, seatsLeft)}
                        {...field}
                        data-testid="input-booking-seats"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">
                    {form.watch("numberOfSeats") || 1} seat(s) × ₹{parseFloat(workshop.price).toFixed(2)}
                  </span>
                  <span className="font-semibold">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Date</span>
                  <span>{format(workshopDate, "MMM d, yyyy")} at {workshop.time}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Location</span>
                  <span>{workshop.venue}</span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
                data-testid="button-confirm-booking"
              >
                {mutation.isPending ? "Processing..." : `Book for ₹${totalPrice.toFixed(2)}`}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function Workshops() {
  const { data: workshops, isLoading } = useQuery<Workshop[]>({
    queryKey: ["/api/workshops"],
  });

  const upcomingWorkshops = workshops?.filter((w) => !w.isPast) || [];
  const pastWorkshops = workshops?.filter((w) => w.isPast) || [];

  return (
    <main className="pt-24" data-testid="page-workshops">
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${workshopImage})` }}
        />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl md:text-5xl font-normal mb-4">
              Workshops
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Join our hands-on creative workshops for a fun, immersive experience. 
              Perfect for exploring new art forms, team building, or a creative day out 
              with friends.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="upcoming" data-testid="tab-upcoming">
                Upcoming Workshops
              </TabsTrigger>
              <TabsTrigger value="past" data-testid="tab-past">
                Past Workshops
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {isLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <Skeleton className="md:w-1/3 aspect-video md:aspect-auto h-48" />
                        <CardContent className="flex-1 p-6 space-y-4">
                          <Skeleton className="h-6 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-10 w-32" />
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-muted-foreground">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <h3 className="font-display text-xl mb-2">No upcoming workshops</h3>
                  <p>Check back soon for new workshop announcements</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {isLoading ? (
                <div className="space-y-6">
                  {[1, 2].map((i) => (
                    <Card key={i} className="overflow-hidden opacity-75">
                      <div className="flex flex-col md:flex-row">
                        <Skeleton className="md:w-1/3 aspect-video md:aspect-auto h-48" />
                        <CardContent className="flex-1 p-6 space-y-4">
                          <Skeleton className="h-6 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-muted-foreground">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <h3 className="font-display text-xl mb-2">No past workshops</h3>
                  <p>Workshop history will appear here</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </main>
  );
}
