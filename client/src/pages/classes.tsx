import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { GraduationCap, Users, Monitor, MapPin, Clock, Calendar, Check } from "lucide-react";
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
import type { ArtClass } from "@shared/schema";

import classImage from "@assets/generated_images/kids_art_class_setting.png";

const ageGroups = [
  { value: "all", label: "All Ages" },
  { value: "kids", label: "Kids" },
  { value: "adults", label: "Adults" },
];

const skillLevels = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const registrationSchema = z.object({
  studentName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  parentName: z.string().optional(),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

function ClassCard({ artClass }: { artClass: ArtClass }) {
  const [showRegistration, setShowRegistration] = useState(false);
  const { toast } = useToast();
  const spotsLeft = (artClass.maxStudents || 10) - (artClass.enrolledCount || 0);
  const isKidsClass = artClass.ageGroup === "kids";

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      studentName: "",
      email: "",
      phone: "",
      parentName: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: RegistrationForm) => {
      const response = await apiRequest("POST", "/api/class-registrations", {
        ...data,
        classId: artClass.id,
        paymentStatus: "pending",
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Registration successful!",
        description: "You've been registered for this class. We'll send confirmation details to your email.",
      });
      setShowRegistration(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
    },
    onError: () => {
      toast({
        title: "Registration failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationForm) => {
    mutation.mutate(data);
  };

  return (
    <>
      <Card className="overflow-hidden" data-testid={`card-class-${artClass.id}`}>
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/3 aspect-video lg:aspect-square bg-muted">
            {artClass.imageUrl ? (
              <img
                src={artClass.imageUrl}
                alt={artClass.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={classImage}
                alt={artClass.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <CardContent className="flex-1 p-6">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
              <div>
                <h3 className="font-display text-xl font-medium mb-1">
                  {artClass.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {artClass.ageGroup === "all" ? "All Ages" : artClass.ageGroup}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {artClass.skillLevel}
                  </Badge>
                  <Badge variant="outline">
                    {artClass.format === "online" ? (
                      <><Monitor className="h-3 w-3 mr-1" /> Online</>
                    ) : artClass.format === "offline" ? (
                      <><MapPin className="h-3 w-3 mr-1" /> In-Person</>
                    ) : (
                      <>Both Options</>
                    )}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-primary font-accent text-xl font-semibold">
                  ${parseFloat(artClass.price).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">per session</p>
              </div>
            </div>

            <p className="text-muted-foreground mb-4 leading-relaxed">
              {artClass.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{artClass.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{artClass.schedule}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{spotsLeft} spots left</span>
              </div>
            </div>

            <Button
              onClick={() => setShowRegistration(true)}
              disabled={spotsLeft <= 0 || !artClass.isActive}
              data-testid={`button-register-class-${artClass.id}`}
            >
              {spotsLeft <= 0 ? "Class Full" : "Register Now"}
            </Button>
          </CardContent>
        </div>
      </Card>

      <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Register for {artClass.title}
            </DialogTitle>
            <DialogDescription>
              Fill in your details to register for this class. Payment will be collected upon confirmation.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="studentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isKidsClass ? "Student Name" : "Your Name"}</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} data-testid="input-student-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isKidsClass && (
                <FormField
                  control={form.control}
                  name="parentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent/Guardian Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Parent's name" {...field} data-testid="input-parent-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} data-testid="input-registration-email" />
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
                      <Input placeholder="+1 (555) 123-4567" {...field} data-testid="input-registration-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Class Fee</span>
                  <span className="font-semibold">${parseFloat(artClass.price).toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Payment will be processed after registration confirmation.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
                data-testid="button-submit-registration"
              >
                {mutation.isPending ? "Registering..." : "Complete Registration"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function Classes() {
  const [selectedAge, setSelectedAge] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const { data: classes, isLoading } = useQuery<ArtClass[]>({
    queryKey: ["/api/classes"],
  });

  const filteredClasses = classes?.filter((c) => {
    const ageMatch = selectedAge === "all" || c.ageGroup === selectedAge || c.ageGroup === "all";
    const levelMatch = selectedLevel === "all" || c.skillLevel === selectedLevel;
    return ageMatch && levelMatch && c.isActive;
  });

  return (
    <main className="pt-24" data-testid="page-classes">
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${classImage})` }}
        />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl md:text-5xl font-normal mb-4">
              Art Classes
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Discover your creative potential with our structured art classes designed 
              for all ages and skill levels. Learn from an experienced art educator in 
              a supportive environment.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center text-sm text-muted-foreground mr-2">
                Age Group:
              </span>
              {ageGroups.map((age) => (
                <Button
                  key={age.value}
                  variant={selectedAge === age.value ? "default" : "outline"}
                  size="sm"
                  className="font-accent text-sm"
                  onClick={() => setSelectedAge(age.value)}
                  data-testid={`button-filter-age-${age.value}`}
                >
                  {age.label}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center text-sm text-muted-foreground mr-2">
                Skill Level:
              </span>
              {skillLevels.map((level) => (
                <Button
                  key={level.value}
                  variant={selectedLevel === level.value ? "default" : "outline"}
                  size="sm"
                  className="font-accent text-sm"
                  onClick={() => setSelectedLevel(level.value)}
                  data-testid={`button-filter-level-${level.value}`}
                >
                  {level.label}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="flex flex-col lg:flex-row">
                    <Skeleton className="lg:w-1/3 aspect-video lg:aspect-square" />
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
          ) : filteredClasses && filteredClasses.length > 0 ? (
            <div className="space-y-6">
              {filteredClasses.map((artClass) => (
                <ClassCard key={artClass.id} artClass={artClass} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="font-display text-xl mb-2">No classes available</h3>
              <p>Check back soon for new class offerings</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
