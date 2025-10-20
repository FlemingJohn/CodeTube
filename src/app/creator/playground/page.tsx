
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Wand2, Type, Languages, CaseUpper, WrapText, Book, ArrowLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { handleProofreadText, handleSummarizeText, handleTranslateText, handleWriteText, handleRewriteText } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/codetube/Header';
import AuthHeader from '@/components/auth/AuthHeader';
import Link from 'next/link';

type AITool = 'writer' | 'rewriter' | 'summarizer' | 'proofreader' | 'translator';

const LANGUAGES = [
    { value: 'English', label: 'English' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Japanese', label: 'Japanese' },
    { value: 'Chinese', label: 'Chinese' },
    { value: 'Korean', label: 'Korean' },
];

const TONES = ['Professional', 'Casual', 'Confident', 'Friendly', 'Formal'];

export default function PlaygroundPage() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [targetLanguage, setTargetLanguage] = useState('Spanish');
    const [rewriteTone, setRewriteTone] = useState('Professional');
    const [activeTab, setActiveTab] = useState<AITool>('writer');
    
    const handleGenerate = () => {
        startTransition(async () => {
            setOutputText('');
            let result;
            try {
                switch (activeTab) {
                    case 'writer':
                        if (!inputText) {
                            toast({ variant: 'destructive', title: 'Prompt is empty' });
                            return;
                        }
                        result = await handleWriteText({ prompt: inputText });
                        if(result.writtenText) setOutputText(result.writtenText);
                        break;
                    case 'rewriter':
                        if (!inputText) {
                            toast({ variant: 'destructive', title: 'Input text is empty' });
                            return;
                        }
                        result = await handleRewriteText({ text: inputText, tone: rewriteTone });
                        if (result.rewrittenText) setOutputText(result.rewrittenText);
                        break;
                    case 'summarizer':
                        if (!inputText) {
                            toast({ variant: 'destructive', title: 'Input text is empty' });
                            return;
                        }
                        result = await handleSummarizeText({ text: inputText });
                        if (result.summary) setOutputText(result.summary);
                        break;
                    case 'proofreader':
                        if (!inputText) {
                            toast({ variant: 'destructive', title: 'Input text is empty' });
                            return;
                        }
                        result = await handleProofreadText({ text: inputText });
                        if (result.correctedText) setOutputText(result.correctedText);
                        break;
                    case 'translator':
                        if (!inputText) {
                            toast({ variant: 'destructive', title: 'Input text is empty' });
                            return;
                        }
                        result = await handleTranslateText({ text: inputText, targetLanguage });
                        if (result.translatedText) setOutputText(result.translatedText);
                        break;
                }

                if (result && result.error) {
                    toast({ variant: 'destructive', title: 'An error occurred', description: result.error });
                }
            } catch (e: any) {
                toast({ variant: 'destructive', title: 'An error occurred', description: e.message });
            }
        });
    };

    const getToolConfig = (tool: AITool) => {
        switch (tool) {
          case 'writer':
            return { icon: <Type />, title: 'Writer', description: 'Create original and engaging text from a prompt.', inputLabel: 'Your Prompt', outputLabel: 'Generated Text' };
          case 'rewriter':
            return { icon: <CaseUpper />, title: 'Rewriter', description: 'Improve content with alternative options and tones.', inputLabel: 'Original Text', outputLabel: 'Rewritten Text' };
          case 'summarizer':
            return { icon: <WrapText />, title: 'Summarizer', description: 'Distill complex information into clear insights.', inputLabel: 'Text to Summarize', outputLabel: 'Summary' };
          case 'proofreader':
            return { icon: <Book />, title: 'Proofreader', description: 'Correct grammar and spelling mistakes with ease.', inputLabel: 'Text to Proofread', outputLabel: 'Corrected Text' };
          case 'translator':
            return { icon: <Languages />, title: 'Translator', description: 'Translate text into your preferred language.', inputLabel: 'Text to Translate', outputLabel: 'Translated Text' };
        }
    };
    
    const { icon, title, description, inputLabel, outputLabel } = getToolConfig(activeTab);

  return (
    <>
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
            <div className="mr-auto md:mr-4 flex">
                <Header />
            </div>
            <div className="flex items-center justify-end ml-auto">
                <AuthHeader />
            </div>
            </div>
        </header>

        <main className="container py-8">
            <div className="mb-8">
                <Button variant="ghost" asChild>
                    <Link href="/creator">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Courses
                    </Link>
                </Button>
                <div className="text-center mt-4">
                    <h1 className="text-4xl font-bold font-headline">AI Playground</h1>
                    <p className="text-lg text-muted-foreground mt-2">A suite of powerful AI tools to help you create better content.</p>
                </div>
            </div>

            <Card>
                <CardContent className="p-4">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AITool)} className="w-full">
                    <TabsList className="grid w-full grid-cols-5 mb-4">
                        <TabsTrigger value="writer"><Type className="mr-2"/> Writer</TabsTrigger>
                        <TabsTrigger value="rewriter"><CaseUpper className="mr-2"/> Rewriter</TabsTrigger>
                        <TabsTrigger value="summarizer"><WrapText className="mr-2"/> Summarizer</TabsTrigger>
                        <TabsTrigger value="proofreader"><Book className="mr-2"/> Proofreader</TabsTrigger>
                        <TabsTrigger value="translator"><Languages className="mr-2"/> Translator</TabsTrigger>
                    </TabsList>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <Card className="bg-muted/30">
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>{icon} {inputLabel}</CardTitle>
                                {activeTab === 'writer' && <CardDescription>Enter a topic or instruction for the AI to write about.</CardDescription>}
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <Textarea
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder={activeTab === 'writer' ? "e.g., Write a short blog post about the benefits of learning React." : "Enter your text here..."}
                                    rows={10}
                                    className="text-base"
                                />
                                {activeTab === 'translator' && (
                                    <div className='space-y-2'>
                                        <Label>Target Language</Label>
                                        <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select language" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {LANGUAGES.map(lang => (
                                                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                {activeTab === 'rewriter' && (
                                    <div className='space-y-2'>
                                        <Label>Tone</Label>
                                        <Select value={rewriteTone} onValueChange={setRewriteTone}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select tone" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {TONES.map(tone => (
                                                    <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="bg-muted/30">
                            <CardHeader>
                                <CardTitle>{outputLabel}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={isPending ? "Generating..." : outputText}
                                    readOnly
                                    placeholder="AI output will appear here..."
                                    rows={10}
                                    className="text-base"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <Button size="lg" onClick={handleGenerate} disabled={isPending}>
                            {isPending ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <Wand2 className="mr-2 h-5 w-5" />
                            )}
                            Generate
                        </Button>
                    </div>

                </Tabs>
                </CardContent>
            </Card>
        </main>
    </>
  );
}
