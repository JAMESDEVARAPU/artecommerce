import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Brush, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { GalleryItem } from "@shared/schema";

const categories = [
  { value: "all", label: "All" },
  { value: "decor", label: "Home Décor" },
  { value: "gifts", label: "Gifts" },
  { value: "paintings", label: "Paintings" },
  { value: "crafts", label: "Crafts" },
];

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const { data: galleryItems, isLoading } = useQuery<GalleryItem[]>({
    queryKey: ["/api/gallery"],
  });

  const filteredItems =
    selectedCategory === "all"
      ? galleryItems
      : galleryItems?.filter((item) => item.category === selectedCategory);

  return (
    <main className="pt-24" data-testid="page-gallery">
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-normal mb-4">
              Gallery
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our collection of handmade art, décor, and creative pieces
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                className="font-accent text-sm"
                onClick={() => setSelectedCategory(category.value)}
                data-testid={`button-category-${category.value}`}
              >
                {category.label}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="aspect-square rounded-lg"
                />
              ))}
            </div>
          ) : filteredItems && filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`relative overflow-hidden rounded-lg cursor-pointer group ${
                    index % 5 === 0 ? "row-span-2" : ""
                  }`}
                  onClick={() => setSelectedItem(item)}
                  data-testid={`gallery-item-${item.id}`}
                >
                  <div className={`${index % 5 === 0 ? "aspect-[2/3]" : "aspect-square"} w-full`}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h4 className="text-white font-medium truncate">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-white/80 text-sm truncate">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <Brush className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="font-display text-xl mb-2">No items yet</h3>
              <p>Gallery items will appear here soon</p>
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {selectedItem && (
            <div className="relative">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                className="w-full max-h-[80vh] object-contain bg-black"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h3 className="text-white font-display text-2xl mb-2">
                  {selectedItem.title}
                </h3>
                {selectedItem.description && (
                  <p className="text-white/80">{selectedItem.description}</p>
                )}
                <span className="inline-block mt-2 text-sm text-white/60 uppercase tracking-wider font-accent">
                  {selectedItem.category}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
