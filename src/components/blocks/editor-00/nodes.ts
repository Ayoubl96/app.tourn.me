import {
  Klass,
  LexicalNode,
  LexicalNodeReplacement,
  ParagraphNode,
  TextNode
} from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';

export const nodes = [HeadingNode, ParagraphNode, TextNode, QuoteNode] as const;
