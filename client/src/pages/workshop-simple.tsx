import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function WorkshopSimple() {
  const [showForm, setShowForm] = useState(false);
  const [workshops, setWorkshops] = useState([]);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    price: "",
    requirements: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newWorkshop = { ...formData, id: Date.now() };
    setWorkshops([...workshops, newWorkshop]);
    
    // Store in localStorage for user access
    const existingWorkshops = JSON.parse(localStorage.getItem('userWorkshops') || '[]');
    localStorage.setItem('userWorkshops', JSON.stringify([...existingWorkshops, newWorkshop]));
    
    // Show notification for users
    localStorage.setItem('newWorkshopNotification', JSON.stringify({
      title: formData.title,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      timestamp: Date.now()
    }));
    
    toast({ title: "Workshop added successfully" });
    setFormData({ title: "", description: "", date: "", time: "", location: "", price: "", requirements: "" });
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display text-lg">Workshops</h3>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Workshop
        </Button>
      </div>

      {showForm && (
        <div className="border rounded-lg p-4 mb-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Workshop Title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required
              />
            </div>
            <Input
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              required
            />
            <Input
              placeholder="Price (₹)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
            />
            <Textarea
              placeholder="Requirements"
              value={formData.requirements}
              onChange={(e) => setFormData({...formData, requirements: e.target.value})}
            />
            <div className="flex gap-2">
              <Button type="submit">Save Workshop</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {workshops.length > 0 ? (
        <div className="space-y-4">
          {workshops.map((workshop) => (
            <div key={workshop.id} className="border rounded-lg p-4">
              <h4 className="font-medium">{workshop.title}</h4>
              <p className="text-sm text-gray-600">{workshop.description}</p>
              <div className="mt-2 text-sm space-y-1">
                <p><strong>📅 Date & Time:</strong> {workshop.date} at {workshop.time}</p>
                <p><strong>📍 Location:</strong> {workshop.location}</p>
                <p><strong>💰 Price:</strong> ₹{workshop.price}</p>
                {workshop.requirements && <p><strong>📋 Requirements:</strong> {workshop.requirements}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No workshops yet</p>
        </div>
      )}
    </div>
  );
}