
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Wand2, ArrowLeft, Brain, Code, Bug, FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { handleWriteText, handleFixCodeError } from '@/app/actions';
import { Label } from '@/components/ui/label';
import Header from '@/components/codetube/Header';
import AuthHeader from '@/components/auth/AuthHeader';
import Link from 'next/link';

type AITool = 'explainer' | 'code_example' | 'debugger' | 'readme_writer';

export default function PlaygroundPage() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [inputText, setInputText] = useState('');
    const [errorText, setErrorText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [activeTab, setActiveTab] = useState<AITool>('explainer');
    
    const handleGenerate = () => {
        startTransition(async () => {
            setOutputText('');
            let result;
            try {
                switch (activeTab) {
                    case 'explainer':
                        if (!inputText) { toast({ variant: 'destructive', title: 'Input is empty' }); return; }
                        result = await handleWriteText({ prompt: `Explain the following concept in simple terms, as if you were teaching a beginner:\n\n${inputText}` });
                        if(result.writtenText) setOutputText(result.writtenText);
                        break;
                    case 'code_example':
                        if (!inputText) { toast({ variant: 'destructive', title: 'Input is empty' }); return; }
                        result = await handleWriteText({ prompt: `Provide a clear, simple code example for the following request. Include a brief explanation of how the code works. \n\nRequest: "${inputText}"` });
                        if (result.writtenText) setOutputText(result.writtenText);
                        break;
                    case 'debugger':
                        if (!inputText) { toast({ variant: 'destructive', title: 'Code is empty' }); return; }
                        if (!errorText) { toast({ variant: 'destructive', title: 'Error message is empty' }); return; }
                        result = await handleFixCodeError({ code: inputText, error: errorText });
                        if (result.fixedCode) setOutputText(result.fixedCode);
                        break;
                    case 'readme_writer':
                         if (!inputText) { toast({ variant: 'destructive', title: 'Project description is empty' }); return; }
                        result = await handleWriteText({ prompt: `Generate a professional README.md file for a project. The project description is: "${inputText}". Include sections for Description, Features, Installation, and Usage.` });
                        if (result.writtenText) setOutputText(result.writtenText);
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
          case 'explainer':
            return { icon: <Brain />, title: 'Explain a Concept', inputLabel: 'Concept to Explain', outputLabel: 'Explanation' };
          case 'code_example':
            return { icon: <Code />, title: 'Get a Code Example', inputLabel: 'What code do you need?', outputLabel: 'Generated Code' };
          case 'debugger':
            return { icon: <Bug />, title: 'Debug My Code', inputLabel: 'Your Code', outputLabel: 'Fixed Code' };
          case 'readme_writer':
            return { icon: <FileText />, title: 'Write a README', inputLabel: 'Project Description', outputLabel: 'Generated README.md' };
        }
    };
    
    const { icon, title, inputLabel, outputLabel } = getToolConfig(activeTab);

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
                    <h1 className="text-4xl font-bold font-headline">AI Study Hub</h1>
                    <p className="text-lg text-muted-foreground mt-2">Your personal AI-powered learning assistant.</p>
                </div>
            </div>

            <Card>
                <CardContent className="p-4">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AITool)} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-4">
                        <TabsTrigger value="explainer"><Brain className="mr-2"/> Explainer</TabsTrigger>
                        <TabsTrigger value="code_example"><Code className="mr-2"/> Code Example</TabsTrigger>
                        <TabsTrigger value="debugger"><Bug className="mr-2"/> Debugger</TabsTrigger>
                        <TabsTrigger value="readme_writer"><FileText className="mr-2"/> README Writer</TabsTrigger>
                    </TabsList>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <Card className="bg-muted/30">
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>{icon} {inputLabel}</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <Textarea
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder={activeTab === 'explainer' ? 'e.g., What is a promise in JavaScript?' : 'Enter your text here...'}
                                    rows={activeTab === 'debugger' ? 6 : 10}
                                    className="text-base"
                                />
                                {activeTab === 'debugger' && (
                                    <div className='space-y-2'>
                                        <Label>Error Message</Label>
                                        <Textarea
                                            value={errorText}
                                            onChange={(e) => setErrorText(e.target.value)}
                                            placeholder="Paste the error message from the console here."
                                            rows={3}
                                            className="font-mono text-xs"
                                        />
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
                                    className={activeTab === 'debugger' || activeTab === 'code_example' || activeTab === 'readme_writer' ? "font-mono text-sm" : "text-base"}
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
