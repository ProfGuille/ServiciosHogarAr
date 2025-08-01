import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Key,
  Globe,
  FileText,
  Settings,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { useEffect } from "react";

export default function AdminWordPress() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // API Keys management
  const { data: apiKeys = [], isLoading: loadingKeys } = useQuery({
    queryKey: ["/api/admin/wordpress/api-keys"],
    enabled: isAuthenticated,
  });

  const createKeyMutation = useMutation({
    mutationFn: async (data: { keyName: string; permissions: string[]; expiresAt?: string }) => {
      return await apiRequest("POST", "/api/admin/wordpress/api-keys", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/wordpress/api-keys"] });
      toast({
        title: "API Key Created",
        description: "WordPress API key created successfully",
      });
      setNewKeyForm({ keyName: "", permissions: [], expiresAt: "" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
    },
  });

  // SEO metadata management
  const createSEOMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/seo", data);
    },
    onSuccess: () => {
      toast({
        title: "SEO Updated",
        description: "SEO metadata saved successfully",
      });
      setSeoForm({
        pageType: "",
        identifier: "",
        title: "",
        description: "",
        keywords: "",
        canonicalUrl: "",
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update SEO metadata",
        variant: "destructive",
      });
    },
  });

  const [newKeyForm, setNewKeyForm] = useState({
    keyName: "",
    permissions: [] as string[],
    expiresAt: "",
  });

  const [seoForm, setSeoForm] = useState({
    pageType: "",
    identifier: "",
    title: "",
    description: "",
    keywords: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
  });

  const handleCreateApiKey = () => {
    if (!newKeyForm.keyName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a key name",
        variant: "destructive",
      });
      return;
    }

    createKeyMutation.mutate({
      keyName: newKeyForm.keyName,
      permissions: ["read", "write"], // Default permissions
      expiresAt: newKeyForm.expiresAt || undefined,
    });
  };

  const handleCreateSEO = () => {
    if (!seoForm.pageType || !seoForm.title || !seoForm.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in required fields (Page Type, Title, Description)",
        variant: "destructive",
      });
      return;
    }

    createSEOMutation.mutate(seoForm);
  };

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString();
  };

  const getStatusBadge = (isActive: boolean, expiresAt: string | null) => {
    if (!isActive) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Globe className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">WordPress Integration</h1>
          <p className="text-muted-foreground">
            Manage WordPress content synchronization and SEO settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            SEO Settings
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Content Sync
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New API Key</CardTitle>
              <CardDescription>
                Generate a new API key for WordPress to communicate with the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g., WordPress Production"
                    value={newKeyForm.keyName}
                    onChange={(e) => setNewKeyForm(prev => ({ ...prev, keyName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={newKeyForm.expiresAt}
                    onChange={(e) => setNewKeyForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                  />
                </div>
              </div>
              <Button 
                onClick={handleCreateApiKey}
                disabled={createKeyMutation.isPending}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {createKeyMutation.isPending ? "Creating..." : "Create API Key"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing API Keys</CardTitle>
              <CardDescription>
                Manage your WordPress integration API keys
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingKeys ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No API keys created yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((key: any) => (
                    <div key={key.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{key.keyName}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Created: {formatDate(key.createdAt)}</span>
                            <span>•</span>
                            <span>Last used: {formatDate(key.lastUsedAt)}</span>
                          </div>
                        </div>
                        {getStatusBadge(key.isActive, key.expiresAt)}
                      </div>
                      
                      <div className="space-y-2">
                        <Label>API Key</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={showApiKey[key.id] ? key.apiKey : "••••••••••••••••••••••••••••••••"}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleApiKeyVisibility(key.id)}
                          >
                            {showApiKey[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      {key.expiresAt && (
                        <div className="text-sm text-muted-foreground">
                          Expires: {formatDate(key.expiresAt)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Metadata Management</CardTitle>
              <CardDescription>
                Configure SEO settings for different page types and content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pageType">Page Type</Label>
                  <select
                    id="pageType"
                    className="w-full p-2 border rounded-md"
                    value={seoForm.pageType}
                    onChange={(e) => setSeoForm(prev => ({ ...prev, pageType: e.target.value }))}
                  >
                    <option value="">Select page type</option>
                    <option value="home">Home Page</option>
                    <option value="services">Services Page</option>
                    <option value="service_detail">Service Detail</option>
                    <option value="provider_profile">Provider Profile</option>
                    <option value="category">Category Page</option>
                    <option value="location">Location Page</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="identifier">Identifier (Optional)</Label>
                  <Input
                    id="identifier"
                    placeholder="e.g., category-id, provider-id"
                    value={seoForm.identifier}
                    onChange={(e) => setSeoForm(prev => ({ ...prev, identifier: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Page title (max 160 characters)"
                  maxLength={160}
                  value={seoForm.title}
                  onChange={(e) => setSeoForm(prev => ({ ...prev, title: e.target.value }))}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {seoForm.title.length}/160
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Page description (max 320 characters)"
                  maxLength={320}
                  value={seoForm.description}
                  onChange={(e) => setSeoForm(prev => ({ ...prev, description: e.target.value }))}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {seoForm.description.length}/320
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    placeholder="comma, separated, keywords"
                    value={seoForm.keywords}
                    onChange={(e) => setSeoForm(prev => ({ ...prev, keywords: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="canonicalUrl">Canonical URL</Label>
                  <Input
                    id="canonicalUrl"
                    placeholder="https://servicioshogar.com.ar/page"
                    value={seoForm.canonicalUrl}
                    onChange={(e) => setSeoForm(prev => ({ ...prev, canonicalUrl: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Open Graph Settings</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ogTitle">OG Title</Label>
                    <Input
                      id="ogTitle"
                      placeholder="Open Graph title"
                      value={seoForm.ogTitle}
                      onChange={(e) => setSeoForm(prev => ({ ...prev, ogTitle: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ogDescription">OG Description</Label>
                    <Textarea
                      id="ogDescription"
                      placeholder="Open Graph description"
                      value={seoForm.ogDescription}
                      onChange={(e) => setSeoForm(prev => ({ ...prev, ogDescription: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ogImage">OG Image URL</Label>
                    <Input
                      id="ogImage"
                      placeholder="https://example.com/image.jpg"
                      value={seoForm.ogImage}
                      onChange={(e) => setSeoForm(prev => ({ ...prev, ogImage: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleCreateSEO}
                disabled={createSEOMutation.isPending}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                {createSEOMutation.isPending ? "Saving..." : "Save SEO Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>WordPress Integration Status</CardTitle>
              <CardDescription>
                Monitor content synchronization between WordPress and the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">API Endpoints</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    WordPress can sync categories, providers, and content
                  </p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">SEO Ready</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Dynamic metadata and structured data
                  </p>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium">Security</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    API key authentication required
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Available Endpoints for WordPress</h4>
                <div className="space-y-2 text-sm font-mono bg-muted p-4 rounded-lg">
                  <div><span className="text-green-600">GET</span> /api/wordpress/categories</div>
                  <div><span className="text-green-600">GET</span> /api/wordpress/providers</div>
                  <div><span className="text-blue-600">POST</span> /api/wordpress/content/sync</div>
                  <div><span className="text-green-600">GET</span> /api/wordpress/sync-logs</div>
                  <div><span className="text-green-600">GET</span> /api/seo/:pageType/:identifier?</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">WordPress Plugin Requirements</h4>
                <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                  <li>• Use API key in X-API-Key header</li>
                  <li>• Sync content with POST /api/wordpress/content/sync</li>
                  <li>• Fetch categories and providers for content creation</li>
                  <li>• Implement SEO metadata from /api/seo endpoints</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}