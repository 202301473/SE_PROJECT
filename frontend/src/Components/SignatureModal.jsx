import React, { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import { Label } from '@/Components/ui/Label';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const SignatureModal = ({ editor, messages, setMessages, onClose }) => {
  const [partyName, setPartyName] = useState('');
  const [signatureFile, setSignatureFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && ['image/png','image/jpeg','image/jpg','image/webp'].includes(file.type)) {
      setSignatureFile(file);
    } else {
      toast.error('Please select a PNG, JPG, or WEBP image.');
    }
  };

  const handleAddSignature = async () => {
    if (!partyName.trim() || !signatureFile || !editor) {
      toast.error('Please provide a party name and a signature image.');
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append('signature', signatureFile);
      const res = await axios.post('api/utils/upload-signature/', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data?.url;
      if (!url) {
        toast.error('Upload failed. No URL returned.');
        setLoading(false);
        return;
      }

      const signatureMarkdown = `![Signature for ${partyName}](${url})`;
      const instruction = `You are formatting a legal document. Insert and position the signature image for "${partyName}" in the correct designated area. Use exactly this markdown for the signature: ${signatureMarkdown}\nPreserve all existing content and headings. Return the entire updated document in JSON as {"type":"document","text":"...markdown..."}.`.replace(/\\/g, '\\\\');

      let payloadMessages = [...messages];
      if (editor.getText()) {
        const markdownContext = editor.storage.markdown.getMarkdown().replace(/\\/g, '\\\\');
        payloadMessages = [
          { sender: 'user', text: `Here is the legal document we are working on. Please use this as the basis for any updates.

---

${markdownContext}` },
          { sender: 'bot', text: 'Okay, I have the document. What changes would you like to make?' }
        ];
      }
      payloadMessages.push({ sender: 'user', text: instruction });

      const chatRes = await axios.post('api/ai-generator/chat/', { messages: payloadMessages });
      const aiResponse = chatRes.data;
      if (aiResponse.type === 'document') {
        const documentMarkdown = aiResponse.text;
        editor.commands.setContent(documentMarkdown);
        const newBotMessages = [
          { sender: 'bot', type: 'document_context', text: documentMarkdown },
          { sender: 'bot', type: 'display', text: `I have updated the document with the signature for ${partyName}.` }
        ];
        setMessages(newBotMessages);
        toast.success('Signature placed and document formatted.');
      } else {
        const newMessages = [...messages, { sender: 'bot', type: 'display', text: aiResponse.text || 'AI responded. Please review the update.' }];
        setMessages(newMessages);
        toast.success('AI responded. Please review the update.');
      }
      onClose();
    } catch (error) {
      console.error('Signature placement error:', error);
      const msg = error.response?.data?.error || 'Failed to place signature.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add Signature</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="party-name">Party's Name</Label>
            <Input
              id="party-name"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="e.g., Landlord, Tenant, First Party"
            />
          </div>
          <div>
            <Label>Signature Image</Label>
            <div
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-md cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="flex text-sm text-muted-foreground">
                  <p className="pl-1">{signatureFile ? signatureFile.name : 'Upload a file'}</p>
                </div>
                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 10MB</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <Button onClick={handleAddSignature} disabled={loading || !partyName || !signatureFile}>
            {loading ? 'Adding...' : 'Add Signature to Document'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignatureModal;
