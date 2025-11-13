import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import DOMPurify from 'dompurify';
import { Button } from "@/Components/ui/Button";
import { FileText, Download, MessageCircle, X, User, Edit } from 'lucide-react';
import CommentList from '../Components/Comments/CommentList';
import { saveAs } from 'file-saver';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { Indent } from '../lib/tiptap-extensions/indent';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import MenuBar from '../Components/MenuBar';

const SharedDocumentView = () => {
  const { id: mongoConversationId } = useParams();
  const [title, setTitle] = useState('Loading Document...');
  const [documentContent, setDocumentContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCommentsSidebarOpen, setIsCommentsSidebarOpen] = useState(false);
  const [documentOwner, setDocumentOwner] = useState('anonymous');
  const [canEdit, setCanEdit] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Image.configure({ inline: true }),
      Indent,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
    ],
    content: documentContent,
    editable: isEditMode,
    onUpdate: ({ editor }) => {
      setDocumentContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'markdown-preview p-8 bg-card/60 border border-border/10 rounded-b-2xl backdrop-blur-xl text-foreground overflow-hidden',
      },
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditMode);
      if (editor.getHTML() !== documentContent) {
        editor.commands.setContent(documentContent, false);
      }
    }
  }, [isEditMode, documentContent, editor]);

  const fetchDocument = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`api/documents/conversations/${mongoConversationId}/`);
      const conversation = response.data;
      setTitle(conversation.title || 'Untitled Document');
      setDocumentOwner(conversation.owner || 'anonymous');

      if (conversation.share_permissions && conversation.share_permissions.permission_level === 'edit') {
        setCanEdit(true);
      }

      if (conversation.document_versions && conversation.document_versions.length > 0) {
        const latestVersion = conversation.document_versions[conversation.document_versions.length - 1];
        setDocumentContent(latestVersion.content);
      } else {
        setDocumentContent('No content available for this document.');
      }
    } catch (err) {
      console.error('Error fetching document:', err);
      setError('Failed to load document. It might not exist or you do not have access.');
      toast.error('Failed to load document.');
    } finally {
      setLoading(false);
    }
  }, [mongoConversationId]);

  useEffect(() => {
    if (mongoConversationId) {
      fetchDocument();
    }
  }, [mongoConversationId, fetchDocument]);

  const handleDownloadPdf = async () => {
    if (!mongoConversationId) {
      toast.error('Document not available for download.');
      return;
    }
    try {
      const response = await axios.get(`api/utils/conversations/${mongoConversationId}/download-latest-pdf/`, {
        responseType: 'blob',
      });
      saveAs(response.data, `${title || 'shared_document'}.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (err) {
      console.error('Error downloading PDF:', err);
      toast.error(`Failed to download PDF: ${err.message}`);
    }
  };

  const handleSave = async () => {
    if (!editor) return;
    try {
      await axios.put(`api/documents/conversations/${mongoConversationId}/`, {
        title: title,
        new_document_content: editor.getHTML(),
        notes: 'Updated from shared link'
      });
      toast.success('Document saved successfully!');
      setIsEditMode(false);
    } catch (err) {
      console.error('Error saving document:', err);
      toast.error('Failed to save document.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background text-foreground">
        <p>Loading document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex relative min-h-screen bg-background text-foreground">
      {/* Header Section - Relative positioning so it doesn't conflict with navbar */}
      <div className="w-full">
        {/* Header Content */}
        <div className="bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl border-b border-border/10 px-8 py-6 mb-8">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-bold text-primary truncate">{title}</h1>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {canEdit && !isEditMode && (
                <Button onClick={() => setIsEditMode(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              {isEditMode && (
                <Button onClick={handleSave}>Save</Button>
              )}
              <Button
                onClick={handleDownloadPdf}
                className="bg-gradient-to-r from-accent to-accent text-foreground rounded-lg shadow-lg shadow-accent/30 hover:shadow-accent/50 transition-all"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsCommentsSidebarOpen(!isCommentsSidebarOpen)}
                className="border-border/20 bg-card/40 hover:bg-card/60 hover:border-border/30 text-muted-foreground rounded-lg backdrop-blur-sm transition-all relative"
                title="View Comments"
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex px-8 gap-8 max-w-6xl mx-auto">
          {/* Document View */}
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <div className="flex-1 border border-border/10 rounded-t-xl overflow-hidden shadow-2xl flex flex-col">
                <MenuBar editor={editor} />
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-card/60 p-8 markdown-preview text-foreground">
                  <EditorContent editor={editor} />
                </div>
              </div>
            ) : (
              <div className="overflow-y-auto custom-scrollbar bg-card/60 border border-border/10 rounded-2xl pt-8 markdown-preview shadow-2xl text-foreground min-h-full">
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(documentContent) }} />
              </div>
            )}
          </div>

          {/* Comments Sidebar - Responsive */}
          <div
            className={`transition-all duration-300 ${
              isCommentsSidebarOpen 
                ? 'w-80 opacity-100' 
                : 'w-0 opacity-0 overflow-hidden'
            }`}
          >
            <div className="bg-card/95 backdrop-blur-xl border border-border/10 rounded-2xl shadow-lg h-[calc(100vh-200px)] flex flex-col overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-border/10">
                <h2 className="text-lg font-semibold text-foreground">Comments</h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsCommentsSidebarOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                {mongoConversationId && <CommentList documentId={mongoConversationId} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedDocumentView;