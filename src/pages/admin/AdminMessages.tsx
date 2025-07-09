
import React, { useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useContact, ContactMessage } from '../../contexts/ContactContext';
import { 
  MessageCircle, 
  HeadphonesIcon, 
  Star, 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  Mail,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

const AdminMessages = () => {
  const { messages, updateMessageStatus } = useContact();
  const [selectedTab, setSelectedTab] = useState('all');

  const getStatusBadge = (status: ContactMessage['status']) => {
    const variants = {
      new: { variant: 'default' as const, color: 'bg-blue-500', icon: Clock },
      'in-progress': { variant: 'secondary' as const, color: 'bg-yellow-500', icon: Clock },
      resolved: { variant: 'outline' as const, color: 'bg-green-500', icon: CheckCircle },
      closed: { variant: 'outline' as const, color: 'bg-gray-500', icon: XCircle }
    };
    
    const config = variants[status];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </Badge>
    );
  };

  const getTypeIcon = (type: ContactMessage['type']) => {
    switch (type) {
      case 'support': return <HeadphonesIcon className="h-4 w-4" />;
      case 'feedback': return <Star className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const filterMessages = (status?: string) => {
    if (status === 'all' || !status) return messages;
    return messages.filter(msg => msg.status === status);
  };

  const getStats = () => {
    return {
      total: messages.length,
      new: messages.filter(m => m.status === 'new').length,
      inProgress: messages.filter(m => m.status === 'in-progress').length,
      resolved: messages.filter(m => m.status === 'resolved').length
    };
  };

  const stats = getStats();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Customer Messages</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Messages</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messages List */}
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">All ({messages.length})</TabsTrigger>
                <TabsTrigger value="new">New ({stats.new})</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress ({stats.inProgress})</TabsTrigger>
                <TabsTrigger value="resolved">Resolved ({stats.resolved})</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab}>
                <div className="space-y-4">
                  {filterMessages(selectedTab).map((message) => (
                    <Card key={message.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(message.type)}
                            <div>
                              <h3 className="font-semibold">{message.subject}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {message.name}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {message.email}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(message.createdAt), 'MMM dd, yyyy HH:mm')}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {message.type}
                            </Badge>
                            {getStatusBadge(message.status)}
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-4 bg-muted/30 p-3 rounded">
                          {message.message}
                        </p>

                        <div className="flex gap-2">
                          {message.status === 'new' && (
                            <Button
                              size="sm"
                              onClick={() => updateMessageStatus(message.id, 'in-progress')}
                            >
                              Start Processing
                            </Button>
                          )}
                          {message.status === 'in-progress' && (
                            <Button
                              size="sm"
                              onClick={() => updateMessageStatus(message.id, 'resolved')}
                            >
                              Mark Resolved
                            </Button>
                          )}
                          {message.status === 'resolved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateMessageStatus(message.id, 'closed')}
                            >
                              Close
                            </Button>
                          )}
                          {message.status !== 'new' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateMessageStatus(message.id, 'new')}
                            >
                              Reopen
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filterMessages(selectedTab).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No messages found for this status.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;
