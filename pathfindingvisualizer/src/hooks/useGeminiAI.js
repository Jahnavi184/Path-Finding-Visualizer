/*
  useGeminiAI.js — encapsulates Gemini client calls for maze generation
  and algorithm explanation streaming.
*/
import { useCallback, useMemo, useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'

export default function useGeminiAI() {
  const [isLoading, setIsLoading] = useState(false)
  const [explanation, setExplanation] = useState('')

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_KEY || import.meta.env.VITE_GEMINI
  const client = useMemo(() => {
    if (!apiKey) {
      console.error('Gemini API key is missing. Set VITE_GEMINI_API_KEY in .env')
      return null
    }
    try {
      return new GoogleGenerativeAI(apiKey)
    } catch (err) {
      console.error('Gemini client init failed', err)
      return null
    }
  }, [apiKey])

  const generateMaze = useCallback(async () => {
    if (!client) throw new Error('No Gemini client')
    setIsLoading(true)
    try {
      const model = client.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: 'You are a maze designer. Generate a solvable maze on a 20x50 grid. Return raw JSON only.'
      })
      const prompt = `You are a maze designer. Generate a solvable maze on a 20x50 grid.\nStart is at [10,5], end is at [10,45].\nReturn ONLY a valid JSON array of [row, col] wall coordinate pairs.\nWalls must not completely block all paths from start to end.\nAim for an interesting, winding layout with dead ends and narrow corridors.\nNo markdown, no explanation, no code fences — raw JSON only.`
      const response = await model.generateContent(prompt)
      const text = response?.response?.text?.() || ''
      if (!text) {
        console.error('generateMaze empty response:', response)
        throw new Error('Empty maze response')
      }
      let coords
      try {
        coords = JSON.parse(text)
      } catch (parseErr) {
        console.warn('generateMaze parse failed, attempting JSON substring extraction', parseErr)
        const jsonMatch = text.match(/\[\s*\[.*\]\s*\]/s)
        if (!jsonMatch) throw parseErr
        coords = JSON.parse(jsonMatch[0])
      }
      setIsLoading(false)
      return coords
    } catch (err) {
      console.error('generateMaze error', err)
      setIsLoading(false)
      throw err
    }
  }, [client])

  const explainAlgorithm = useCallback(async ({ algorithmName, visitedCount, pathLength, executionTime }) => {
    if (!client) {
      console.error('No Gemini client available for explanation')
      return
    }
    setIsLoading(true)
    setExplanation('')
    try {
      const model = client.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: 'You are a CS tutor. Be concise, 3-4 sentences, plain prose, no bullet points.'
      })
      const prompt = `The user just ran ${algorithmName} on a 20x50 grid. It visited ${visitedCount} nodes, found a path of length ${pathLength} nodes, and completed in ${executionTime}ms. Start was [10,5], end was [10,45]. Explain what happened and why, in plain English.`
      const result = await model.generateContentStream(prompt)
      for await (const chunk of result.stream) {
        const chunkText = chunk.text()
        setExplanation(prev => prev + chunkText)
      }
    } catch (err) {
      console.error('explainAlgorithm error', err)
      setExplanation('Explanation failed.')
    } finally {
      setIsLoading(false)
    }
  }, [client])

  const clearExplanation = useCallback(() => setExplanation(''), [])

  return { generateMaze, explainAlgorithm, isLoading, explanation, clearExplanation }
}
