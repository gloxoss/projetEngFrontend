import AppLayout from "@/layouts/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Search, 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight
} from "lucide-react";

export default function CallsForOffers() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch calls for offers
  const { data: callsForOffers = [], isLoading } = useQuery({
    queryKey: ["/api/calls-for-offers"],
  });

  // Filter calls based on search term
  const filteredCalls = callsForOffers.filter(call => 
    call.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout title="Appels d'offres ouverts">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Rechercher un appel d'offres..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredCalls.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun appel d'offres trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "Essayez avec d'autres termes de recherche." : "Il n'y a actuellement aucun appel d'offres ouvert."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCalls.map((call) => (
              <Card key={call.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{call.title}</CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            Date limite: {new Date(call.endDate).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={call.status === "open" ? "success" : "outline"}
                      className="ml-2"
                    >
                      {call.status === "open" ? "Ouvert" : "Fermé"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {call.description}
                  </p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Ressources demandées:</h4>
                    <ul className="space-y-1">
                      {call.resources.map((resource, index) => (
                        <li key={index} className="text-sm flex justify-between">
                          <span>{resource.type}</span>
                          <span className="font-medium">{resource.quantity} unités</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <Link href={`/supplier/calls-for-offers/${call.id}`}>
                    <Button className="w-full">
                      Voir les détails
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
