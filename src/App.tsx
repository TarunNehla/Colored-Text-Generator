import React, { useState, useRef } from 'react';
import { Copy } from 'lucide-react';
import { MantineProvider, Container, Title, Text, Button, Group, Stack, Box, Paper } from '@mantine/core';
import '@mantine/core/styles.css';

const TOOLTIP_TEXTS = {
  '30': 'Dark Gray (33%)',
  '31': 'Red',
  '32': 'Yellowish Green',
  '33': 'Gold',
  '34': 'Light Blue',
  '35': 'Pink',
  '36': 'Teal',
  '37': 'White',
  '40': 'Blueish Black',
  '41': 'Rust Brown',
  '42': 'Gray (40%)',
  '43': 'Gray (45%)',
  '44': 'Light Gray (55%)',
  '45': 'Blurple',
  '46': 'Light Gray (60%)',
  '47': 'Cream White',
};

type TooltipProps = {
  text: string;
  position: { top: number; left: number } | null;
};

const Tooltip: React.FC<TooltipProps> = ({ text, position }) => {
  if (!position) return null;
  
  return (
    <Box 
      pos="absolute"
      bg="#3BA55D"
      p="xs"
      style={{
        top: `${position.top - 36}px`,
        left: `${position.left}px`,
        borderRadius: '4px',
        color: 'white',
        fontSize: '14px',
        zIndex: 1000,
      }}
    >
      {text}
    </Box>
  );
};

const StyleButton: React.FC<{
  ansi: string;
  children?: React.ReactNode;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: () => void;
  onClick: () => void;
  className?: string;
  color?: string;
}> = ({ ansi, children, onMouseEnter, onMouseLeave, onClick, className, color }) => (
  <Button
    data-ansi={ansi}
    variant="filled"
    size="compact-sm"
    className={className}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onClick={onClick}
    styles={{
      root: {
        backgroundColor: color || '#4f545c',
        minWidth: '32px',
        minHeight: '32px',
        padding: '0 16px',
        '&:hover': {
          backgroundColor: color ? `${color}dd` : '#36393f',
        }
      }
    }}
  >
    {children}
  </Button>
);

function App() {
  const [tooltipData, setTooltipData] = useState<{ text: string; position: { top: number; left: number } } | null>(null);
  const [copyStatus, setCopyStatus] = useState<{ text: string; isError: boolean }>({ text: 'Copy text as Discord formatted', isError: false });
  const editorRef = useRef<HTMLDivElement>(null);
  let copyTimeout: NodeJS.Timeout | null = null;

  const handleStyleButtonClick = (ansi: string) => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;

    if (ansi === '0') {
      const text = editorRef.current.innerText;
      editorRef.current.innerHTML = text;
      return;
    }

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const span = document.createElement('span');
    span.className = `ansi-${ansi}`;
    
    try {
      range.surroundContents(span);
      selection.removeAllRanges();
    } catch (e) {
      console.error('Failed to apply style:', e);
    }
  };

  const handleTooltip = (e: React.MouseEvent, ansi: string) => {
    if (Number(ansi) <= 4) return;
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltipData({
      text: TOOLTIP_TEXTS[ansi as keyof typeof TOOLTIP_TEXTS],
      position: {
        top: rect.top,
        left: rect.left,
      },
    });
  };

  const handleEditorInput = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    editorRef.current.innerHTML = content.replace(/\n/g, '<br>');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.execCommand('insertLineBreak');
    }
  };

  const handleCopy = async () => {
    if (!editorRef.current) return;

    try {
      const content = editorRef.current.innerHTML;
      const formattedText = '```ansi\n' + content
        .replace(/<span class="ansi-([^"]+)">/g, '\x1b[$1m')
        .replace(/<\/span>/g, '\x1b[0m')
        .replace(/<br>/g, '\n')
        .replace(/&nbsp;/g, ' ') + '\n```';

      await navigator.clipboard.writeText(formattedText);
      
      setCopyStatus({ text: 'Copied!', isError: false });
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        setCopyStatus({ text: 'Copy text as Discord formatted', isError: false });
      }, 2000);
    } catch (error) {
      setCopyStatus({ text: 'Failed to copy!', isError: true });
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        setCopyStatus({ text: 'Copy text as Discord formatted', isError: false });
      }, 2000);
    }
  };

  const getColorForAnsi = (ansi: string): string => {
    const colorMap: Record<string, string> = {
      '30': '#4f545c', '31': '#dc322f', '32': '#859900', '33': '#b58900',
      '34': '#268bd2', '35': '#d33682', '36': '#2aa198', '37': '#ffffff',
      '40': '#002b36', '41': '#cb4b16', '42': '#586e75', '43': '#657b83',
      '44': '#839496', '45': '#6c71c4', '46': '#93a1a1', '47': '#fdf6e3'
    };
    return colorMap[ansi] || '#4f545c';
  };

  return (
    <MantineProvider>
      <Box bg="#36393F" mih="100vh" p="md">
        <Container size="lg">
          <Stack align="center" gap="xl">
            <Title order={1} c="white" ta="center">
              Rebane's Discord <Text span c="#5865F2">Colored</Text> Text Generator
            </Title>
            
            <Paper w={500} bg="transparent" c="white">
              <Title order={3} mb="md">About</Title>
              <Text mb="md">
                This is a simple app that creates colored Discord messages using the ANSI color codes
                available on the latest Discord desktop versions.
              </Text>
              <Text>
                To use this, write your text, select parts of it and assign colors to them,
                then copy it using the button below, and send in a Discord message.
              </Text>
            </Paper>

            <Paper w={500} bg="transparent" c="white">
              <Title order={3} mb="md">Source Code</Title>
              <Text>
                This app runs entirely in your browser and the source code is freely available on{' '}
                <Text component="a" href="https://gist.github.com/rebane2001/07f2d8e80df053c70a1576d27eabe97c" c="#00AFF4">
                  GitHub
                </Text>
                . Shout out to kkrypt0nn for{' '}
                <Text component="a" href="https://gist.github.com/kkrypt0nn/a02506f3712ff2d1c8ca7c9e0aed7c06" c="#00AFF4">
                  this guide
                </Text>
                .
              </Text>
            </Paper>

            <Title order={2} c="white">Create your text</Title>
            
            <Group gap="xs">
              <StyleButton ansi="0" onClick={() => handleStyleButtonClick('0')}>Reset All</StyleButton>
              <StyleButton ansi="1" onClick={() => handleStyleButtonClick('1')} className="font-bold">Bold</StyleButton>
              <StyleButton ansi="4" onClick={() => handleStyleButtonClick('4')} className="underline">Line</StyleButton>
            </Group>

            <Group gap="xs">
              <Text fw="bold" mr="xs">FG</Text>
              {['30', '31', '32', '33', '34', '35', '36', '37'].map((ansi) => (
                <StyleButton
                  key={ansi}
                  ansi={ansi}
                  color={getColorForAnsi(ansi)}
                  onClick={() => handleStyleButtonClick(ansi)}
                  onMouseEnter={(e) => handleTooltip(e, ansi)}
                  onMouseLeave={() => setTooltipData(null)}
                >
                  &nbsp;
                </StyleButton>
              ))}
            </Group>

            <Group gap="xs">
              <Text fw="bold" mr="xs">BG</Text>
              {['40', '41', '42', '43', '44', '45', '46', '47'].map((ansi) => (
                <StyleButton
                  key={ansi}
                  ansi={ansi}
                  color={getColorForAnsi(ansi)}
                  onClick={() => handleStyleButtonClick(ansi)}
                  onMouseEnter={(e) => handleTooltip(e, ansi)}
                  onMouseLeave={() => setTooltipData(null)}
                >
                  &nbsp;
                </StyleButton>
              ))}
            </Group>

            <Paper
              component="div"
              ref={editorRef}
              contentEditable
              w={600}
              h={200}
              bg="#2F3136"
              c="#B9BBBE"
              p="sm"
              style={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '14px',
                lineHeight: '1.125rem',
                border: '1px solid #202225',
                borderRadius: '4px',
                resize: 'both',
                overflow: 'auto',
                outline: 'none',
              }}
              onInput={handleEditorInput}
              onKeyDown={handleKeyDown}
              dangerouslySetInnerHTML={{
                __html: 'Welcome to <span class="ansi-33">Rebane</span>\'s <span class="ansi-45"><span class="ansi-37">Discord</span></span> <span class="ansi-31">C</span><span class="ansi-32">o</span><span class="ansi-33">l</span><span class="ansi-34">o</span><span class="ansi-35">r</span><span class="ansi-36">e</span><span class="ansi-37">d</span> Text Generator!'
              }}
            />

            <Button
              onClick={handleCopy}
              variant="filled"
              leftSection={<Copy size={16} />}
              color={copyStatus.isError ? 'red' : copyStatus.text === 'Copy text as Discord formatted' ? 'gray' : 'green'}
            >
              {copyStatus.text}
            </Button>

            <Text size="sm" c="dimmed">
              This is an unofficial tool, it is not made or endorsed by Discord.
            </Text>
          </Stack>
        </Container>
      </Box>
      <Tooltip text={tooltipData?.text || ''} position={tooltipData?.position || null} />
    </MantineProvider>
  );
}

export default App;