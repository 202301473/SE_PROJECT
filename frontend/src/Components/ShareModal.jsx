import React, { useState } from 'react';
import { Copy, X } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import { Label } from '@/Components/ui/Label';
import { Switch } from '@/Components/ui/switch';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const ShareModal = ({ documentId, documentTitle, latestDocument, onClose }) => {
  const [permissionLevel, setPermissionLevel] = useState('edit');
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const generateLink = async () => {
    setLoading(true);
    try {
      const response = await axios.post('api/documents/generate-share-link/', {
        document_id: documentId,
        permission_level: permissionLevel,
      });
      const url = `${window.location.origin}${response.data.share_url}`;
      setShareUrl(url);
    } catch (err) {
      console.error('Error generating share link:', err);
      toast.error('Failed to generate share link.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Share "{documentTitle}"</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="edit-permission"
              checked={permissionLevel === 'edit'}
              onCheckedChange={(checked) => setPermissionLevel(checked ? 'edit' : 'view')}
            />
            <Label htmlFor="edit-permission">Allow editing</Label>
          </div>
          <Button onClick={generateLink} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Link'}
          </Button>
          {shareUrl && (
            <div className="flex items-center space-x-2">
              <Input value={shareUrl} readOnly />
              <Button onClick={handleCopyToClipboard} size="icon">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareModal;
