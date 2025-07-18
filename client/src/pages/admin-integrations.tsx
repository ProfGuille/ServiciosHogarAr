import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Settings, 
  Key, 
  Activity, 
  BarChart3, 
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  Trash2
} from "lucide-react";
import Navbar from "@/components/layout/navbar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Partner {
  id: number;
  name: string;
  slug: string;
  partnerType: string;
  status: string;
  isVerified: boolean;
  monthlyRequestLimit: number;
  contractStartDate?: string;
  contractEndDate?: string;
  createdAt: string;
}

interface ApiKey {
  id: number;
  keyName: string;
  apiKey: string;
  apiSecret?: string;
  scopes: string[];
  rateLimit: number;
  expiresAt?: string;
  isActive: boolean;
  requestCount: number;
  lastUsedAt?: string;
}

interface UsageStats {
  partnerId: number;
  partnerName: string;
  totalRequests: number;
  successfulRequests: number;
  errorRequests: number;
  successRate: number;
  avgResponseTime: number;
  totalBandwidth: number;
}

export default function AdminIntegrations() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showNewPartnerDialog, setShowNewPartnerDialog] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [newPartnerData, setNewPartnerData] = useState({
    name: "",
    slug: "",
    description: "",
    website: "",
    contactEmail: "",
    partnerType: "technology",
    monthlyRequestLimit: 10000,
    allowedScopes: [] as string[],
    webhookUrl: "",
    ipWhitelist: [] as string[],
  });

  const [newApiKeyData, setNewApiKeyData] = useState({
    keyName: "",
    scopes: [] as string[],
    rateLimit: 100,
    expiresAt: "",
  });

  // Available scopes for API keys
  const availableScopes = [
    { value: "categories:read", label: "Read Categories" },
    { value: "providers:read", label: "Read Providers" },
    { value: "requests:read", label: "Read Service Requests" },
    { value: "analytics:read", label: "Read Analytics" },
    { value: "webhooks:receive", label: "Receive Webhooks" },
  ];

  // Fetch partners
  const { data: partners, isLoading: partnersLoading } = useQuery({
    queryKey: ["/api/admin/partners"],
    enabled: isAuthenticated && user?.userType === "admin",
  });

  // Fetch integration analytics
  const { data: usageStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/integration-analytics"],
    enabled: isAuthenticated && user?.userType === "admin",
  });

  // Create partner mutation
  const createPartnerMutation = useMutation({
    mutationFn: async (data: typeof newPartnerData) => {
      return apiRequest("POST", "/api/admin/partners", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
      setShowNewPartnerDialog(false);
      setNewPartnerData({
        name: "",
        slug: "",
        description: "",
        website: "",
        contactEmail: "",
        partnerType: "technology",
        monthlyRequestLimit: 10000,
        allowedScopes: [],
        webhookUrl: "",
        ipWhitelist: [],
      });
      toast({
        title: "Partner Created",
        description: "New integration partner has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create API key mutation
  const createApiKeyMutation = useMutation({
    mutationFn: async (data: typeof newApiKeyData & { partnerId: number }) => {
      return apiRequest("POST", `/api/admin/partners/${data.partnerId}/api-keys`, data);
    },
    onSuccess: (response) => {
      setShowApiKeyDialog(false);
      setNewApiKeyData({
        keyName: "",
        scopes: [],
        rateLimit: 100,
        expiresAt: "",
      });
      
      // Show API key in a dialog
      toast({
        title: "API Key Created",
        description: "New API key has been generated. Copy it now as it won't be shown again.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated || user?.userType !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-slate-600">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Active", variant: "default" as const, color: "bg-green-100 text-green-800" },
      pending: { label: "Pending", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
      suspended: { label: "Suspended", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
      terminated: { label: "Terminated", variant: "destructive" as const, color: "bg-gray-100 text-gray-800" },
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const getPartnerTypeBadge = (type: string) => {
    const typeConfig = {
      technology: { label: "Technology", color: "bg-blue-100 text-blue-800" },
      marketing: { label: "Marketing", color: "bg-purple-100 text-purple-800" },
      service: { label: "Service", color: "bg-green-100 text-green-800" },
      payment: { label: "Payment", color: "bg-orange-100 text-orange-800" },
      analytics: { label: "Analytics", color: "bg-indigo-100 text-indigo-800" },
      crm: { label: "CRM", color: "bg-pink-100 text-pink-800" },
      other: { label: "Other", color: "bg-gray-100 text-gray-800" },
    };
    return typeConfig[type as keyof typeof typeConfig] || typeConfig.other;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Integration Management
              </h1>
              <p className="text-lg text-slate-600">
                Manage third-party partners and API integrations
              </p>
            </div>
            
            <Dialog open={showNewPartnerDialog} onOpenChange={setShowNewPartnerDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Partner
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Partner</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Partner Name</Label>
                      <Input
                        id="name"
                        value={newPartnerData.name}
                        onChange={(e) => setNewPartnerData({ ...newPartnerData, name: e.target.value })}
                        placeholder="Partner Company Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={newPartnerData.slug}
                        onChange={(e) => setNewPartnerData({ ...newPartnerData, slug: e.target.value })}
                        placeholder="partner-slug"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newPartnerData.description}
                      onChange={(e) => setNewPartnerData({ ...newPartnerData, description: e.target.value })}
                      placeholder="Brief description of the partnership"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={newPartnerData.website}
                        onChange={(e) => setNewPartnerData({ ...newPartnerData, website: e.target.value })}
                        placeholder="https://partner.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={newPartnerData.contactEmail}
                        onChange={(e) => setNewPartnerData({ ...newPartnerData, contactEmail: e.target.value })}
                        placeholder="contact@partner.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="partnerType">Partner Type</Label>
                      <Select 
                        value={newPartnerData.partnerType} 
                        onValueChange={(value) => setNewPartnerData({ ...newPartnerData, partnerType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="payment">Payment</SelectItem>
                          <SelectItem value="analytics">Analytics</SelectItem>
                          <SelectItem value="crm">CRM</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="monthlyLimit">Monthly Request Limit</Label>
                      <Input
                        id="monthlyLimit"
                        type="number"
                        value={newPartnerData.monthlyRequestLimit}
                        onChange={(e) => setNewPartnerData({ ...newPartnerData, monthlyRequestLimit: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
                    <Input
                      id="webhookUrl"
                      value={newPartnerData.webhookUrl}
                      onChange={(e) => setNewPartnerData({ ...newPartnerData, webhookUrl: e.target.value })}
                      placeholder="https://partner.com/webhook"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewPartnerDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => createPartnerMutation.mutate(newPartnerData)}
                      disabled={createPartnerMutation.isPending}
                    >
                      {createPartnerMutation.isPending ? "Creating..." : "Create Partner"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="partners" className="space-y-6">
          <TabsList>
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>

          <TabsContent value="partners">
            <div className="grid gap-6">
              {partnersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Loading partners...</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {partners?.map((partner: Partner) => (
                    <Card key={partner.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{partner.name}</h3>
                              <Badge className={getStatusBadge(partner.status).color}>
                                {getStatusBadge(partner.status).label}
                              </Badge>
                              <Badge className={getPartnerTypeBadge(partner.partnerType).color}>
                                {getPartnerTypeBadge(partner.partnerType).label}
                              </Badge>
                              {partner.isVerified && (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                              <div>Monthly Limit: {partner.monthlyRequestLimit.toLocaleString()} requests</div>
                              <div>Created: {new Date(partner.createdAt).toLocaleDateString()}</div>
                              {partner.contractStartDate && (
                                <div>Contract Start: {new Date(partner.contractStartDate).toLocaleDateString()}</div>
                              )}
                              {partner.contractEndDate && (
                                <div>Contract End: {new Date(partner.contractEndDate).toLocaleDateString()}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Dialog open={showApiKeyDialog && selectedPartner?.id === partner.id} onOpenChange={(open) => {
                              setShowApiKeyDialog(open);
                              if (open) setSelectedPartner(partner);
                            }}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Key className="h-4 w-4 mr-2" />
                                  API Keys
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Generate API Key for {partner.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="keyName">Key Name</Label>
                                    <Input
                                      id="keyName"
                                      value={newApiKeyData.keyName}
                                      onChange={(e) => setNewApiKeyData({ ...newApiKeyData, keyName: e.target.value })}
                                      placeholder="Production API Key"
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label>Permissions</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                      {availableScopes.map((scope) => (
                                        <label key={scope.value} className="flex items-center space-x-2">
                                          <input
                                            type="checkbox"
                                            checked={newApiKeyData.scopes.includes(scope.value)}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                setNewApiKeyData({
                                                  ...newApiKeyData,
                                                  scopes: [...newApiKeyData.scopes, scope.value]
                                                });
                                              } else {
                                                setNewApiKeyData({
                                                  ...newApiKeyData,
                                                  scopes: newApiKeyData.scopes.filter(s => s !== scope.value)
                                                });
                                              }
                                            }}
                                          />
                                          <span className="text-sm">{scope.label}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="rateLimit">Rate Limit (per minute)</Label>
                                      <Input
                                        id="rateLimit"
                                        type="number"
                                        value={newApiKeyData.rateLimit}
                                        onChange={(e) => setNewApiKeyData({ ...newApiKeyData, rateLimit: parseInt(e.target.value) })}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                                      <Input
                                        id="expiresAt"
                                        type="datetime-local"
                                        value={newApiKeyData.expiresAt}
                                        onChange={(e) => setNewApiKeyData({ ...newApiKeyData, expiresAt: e.target.value })}
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>
                                      Cancel
                                    </Button>
                                    <Button 
                                      onClick={() => createApiKeyMutation.mutate({ ...newApiKeyData, partnerId: partner.id })}
                                      disabled={createApiKeyMutation.isPending}
                                    >
                                      {createApiKeyMutation.isPending ? "Generating..." : "Generate Key"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-2" />
                              Configure
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {(!partners || partners.length === 0) && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Partners Yet</h3>
                        <p className="text-slate-600 mb-4">Create your first integration partner to get started.</p>
                        <Button onClick={() => setShowNewPartnerDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Partner
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  API Usage Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Loading analytics...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Partner</TableHead>
                        <TableHead>Total Requests</TableHead>
                        <TableHead>Success Rate</TableHead>
                        <TableHead>Avg Response Time</TableHead>
                        <TableHead>Bandwidth Used</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usageStats?.data?.map((stat: UsageStats) => (
                        <TableRow key={stat.partnerId}>
                          <TableCell className="font-medium">{stat.partnerName}</TableCell>
                          <TableCell>{stat.totalRequests.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={stat.successRate >= 95 ? "bg-green-100 text-green-800" : stat.successRate >= 90 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                              {stat.successRate}%
                            </Badge>
                          </TableCell>
                          <TableCell>{stat.avgResponseTime}ms</TableCell>
                          <TableCell>{(stat.totalBandwidth / 1024 / 1024).toFixed(2)} MB</TableCell>
                          <TableCell>
                            <Badge className={stat.errorRequests === 0 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                              {stat.errorRequests === 0 ? "Healthy" : `${stat.errorRequests} errors`}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!usageStats?.data || usageStats.data.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                            No usage data available yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-slate-600">
                    <h4 className="font-semibold mb-2">Available Webhook Events:</h4>
                    <ul className="space-y-1">
                      <li>• <code>user.created</code> - When a new user registers</li>
                      <li>• <code>provider.verified</code> - When a service provider is verified</li>
                      <li>• <code>request.created</code> - When a new service request is created</li>
                      <li>• <code>request.completed</code> - When a service request is completed</li>
                      <li>• <code>payment.processed</code> - When a payment is processed</li>
                      <li>• <code>review.created</code> - When a new review is submitted</li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Webhook Configuration</h4>
                    <p className="text-sm text-slate-600">
                      Partners with active webhook URLs will automatically receive events based on their integration configuration.
                      All webhooks include retry logic with exponential backoff.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}