/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { allMarkdownShortcuts } from  './marks'
import { makeEditor } from './tests/utils';

describe.each((Object.keys(allMarkdownShortcuts))
  .map(mark => allMarkdownShortcuts[mark].map(shortcut => [mark, shortcut]))
  .flat())('%s with shortcut "%s"', (markName, shortcut) => {
  test('basic shortcut usage', () => {
    const editor = makeEditor(<editor>
      <paragraph>
        <text>
          {shortcut}thing{shortcut.slice(0, -1)}
          <cursor />
        </text>
      </paragraph>
    </editor>)

    editor.insertText(shortcut.slice(-1))
    editor.insertText('s')
    expect(editor).toEqualEditor(makeEditor(<editor marks={{}}>
      <paragraph>
        <text {...{ [markName]: true }}>thing</text>
        <text>
          s<cursor />
        </text>
      </paragraph>
    </editor>))
  })

  test('works when selection is not collapsed', () => {
    const editor = makeEditor(<editor>
      <paragraph>
        <text>
          {shortcut}thing{shortcut.slice(0, -1)}
          <anchor />
          some wonderful content
          <focus />
        </text>
      </paragraph>
    </editor>)

    editor.insertText(shortcut.slice(-1))
    expect(editor).toEqualEditor(makeEditor(<editor marks={{}}>
      <paragraph>
        <text {...{ [markName]: true }}>
          thing
          <cursor />
        </text>
      </paragraph>
    </editor>))
  })
  test('works when the start and ends are in different text nodes', () => {
    const editor = makeEditor(<editor>
      <paragraph>
        <text>{shortcut}t</text>
        <text keyboard>hin</text>
        <text>
          g{shortcut.slice(0, -1)}
          <cursor />
        </text>
      </paragraph>
    </editor>)

    editor.insertText(shortcut.slice(-1))
    expect(editor).toEqualEditor(makeEditor(<editor marks={{}}>
      <paragraph>
        <text {...{ [markName]: true }}>t</text>
        <text keyboard {...{ [markName]: true }}>
          hin
        </text>
        <text {...{ [markName]: true }}>
          g
          <cursor />
        </text>
      </paragraph>
    </editor>))
  })
  test('does match when start of shortcut is in a different text node', () => {
    const editor = makeEditor(<editor>
      <paragraph>
        <text keyboard>{shortcut}</text>
        <text>
          thing{shortcut.slice(0, -1)}
          <cursor />
        </text>
      </paragraph>
    </editor>)

    editor.insertText(shortcut.slice(-1))
    expect(editor).toEqualEditor(makeEditor(<editor marks={{}}>
      <paragraph>
        <text {...{ [markName]: true }}>
          thing
          <cursor />
        </text>
      </paragraph>
    </editor>))
  })
  if (shortcut.length === 2) {
    test('matches when the end shortcut is in a different text node', () => {
      const editor = makeEditor(<editor marks={{ keyboard: true }}>
        <paragraph>
          <text>{shortcut}thing</text>
          <text keyboard>
            {shortcut.slice(0, -1)}
            <cursor />
          </text>
        </paragraph>
      </editor>)

      editor.insertText(shortcut.slice(-1))
      expect(editor).toEqualEditor(makeEditor(<editor marks={{}}>
        <paragraph>
          <text {...{ [markName]: true }}>
            thing
            <cursor />
          </text>
        </paragraph>
      </editor>))
    })
    test(
      'does match when first and second characters in the start shortcut are in different text nodes',
      () => {
        const editor = makeEditor(<editor>
          <paragraph>
            <text keyboard>{shortcut[0]}</text>
            <text>
              {shortcut[1]}thing{shortcut.slice(0, -1)}
              <cursor />
            </text>
          </paragraph>
        </editor>)

        editor.insertText(shortcut.slice(-1))
        expect(editor).toEqualEditor(makeEditor(<editor marks={{}}>
          <paragraph>
            <text {...{ [markName]: true }}>
              thing
              <cursor />
            </text>
          </paragraph>
        </editor>))
      }
    )
  }
  test(
    'matches when the shortcut appears in an invalid position after the valid position in the same text node',
    () => {
      const editor = makeEditor(<editor>
        <paragraph>
          <text>
            some text {shortcut}t{shortcut}hing{shortcut.slice(0, -1)}
            <cursor />
          </text>
        </paragraph>
      </editor>)

      editor.insertText(shortcut.slice(-1))
      expect(editor).toEqualEditor(makeEditor(<editor marks={{}}>
        <paragraph>
          <text>some text </text>
          <text {...{ [markName]: true }}>
            t{shortcut}hing
            <cursor />
          </text>
        </paragraph>
      </editor>))
    }
  )
  test(
    'matches when the shortcut appears in an invalid position before the valid position in the same text node',
    () => {
      const editor = makeEditor(<editor>
        <paragraph>
          <text>
            some{shortcut}text {shortcut}thing{shortcut.slice(0, -1)}
            <cursor />
          </text>
        </paragraph>
      </editor>)

      editor.insertText(shortcut.slice(-1))
      expect(editor).toEqualEditor(makeEditor(<editor marks={{}}>
        <paragraph>
          <text>some{shortcut}text </text>
          <text {...{ [markName]: true }}>
            thing
            <cursor />
          </text>
        </paragraph>
      </editor>))
    }
  )
  test(
    "does not match when there is a different text node before the start of the shortcut that doesn't end in whitespace",
    () => {
      const editor = makeEditor(<editor>
        <paragraph>
          <text keyboard>some text</text>
          <text>
            {shortcut}thing{shortcut.slice(0, -1)}
            <cursor />
          </text>
        </paragraph>
      </editor>)

      editor.insertText(shortcut.slice(-1))
      expect(editor).toEqualEditor(makeEditor(<editor>
        <paragraph>
          <text keyboard>some text</text>
          <text>
            {shortcut}thing{shortcut}
            <cursor />
          </text>
        </paragraph>
      </editor>))
    }
  )
  test(
    'does not match when there is nothing between the start and end of the shortcut',
    () => {
      const editor = makeEditor(<editor>
        <paragraph>
          <text>
            {shortcut + shortcut.slice(0, -1)}
            <cursor />
          </text>
        </paragraph>
      </editor>)
      editor.insertText(shortcut.slice(-1))
      expect(editor).toEqualEditor(makeEditor(<editor>
        <paragraph>
          <text>
            {shortcut.repeat(2)}
            <cursor />
          </text>
        </paragraph>
      </editor>))
    }
  )
  test(
    'does not match when there is whitespace immediately after the end of the start of the shortcut',
    () => {
      const editor = makeEditor(<editor>
        <paragraph>
          <text>
            {shortcut} thing{shortcut.slice(0, -1)}
            <cursor />
          </text>
        </paragraph>
      </editor>)

      editor.insertText(shortcut.slice(-1))
      expect(editor).toEqualEditor(makeEditor(<editor>
        <paragraph>
          <text>
            {shortcut} thing{shortcut}
            <cursor />
          </text>
        </paragraph>
      </editor>))
    }
  )

  test(
    'does not match when there is whitespace immediately before the start of the end shortcut',
    () => {
      const editor = makeEditor(<editor>
        <paragraph>
          <text>
            {shortcut}thing {shortcut.slice(0, -1)}
            <cursor />
          </text>
        </paragraph>
      </editor>)

      editor.insertText(shortcut.slice(-1))
      expect(editor).toEqualEditor(makeEditor(<editor>
        <paragraph>
          <text>
            {shortcut}thing {shortcut}
            <cursor />
          </text>
        </paragraph>
      </editor>))
    }
  )
  test(
    'does not match if there is a non-whitespace character before the start of the shortcut',
    () => {
      const editor = makeEditor(<editor>
        <paragraph>
          <text>
            w{shortcut}thing{shortcut.slice(0, -1)}
            <cursor />
          </text>
        </paragraph>
      </editor>)

      editor.insertText(shortcut.slice(-1))
      expect(editor).toEqualEditor(makeEditor(<editor>
        <paragraph>
          <text>
            w{shortcut}thing{shortcut}
            <cursor />
          </text>
        </paragraph>
      </editor>))
    }
  )
  test(
    'does match if there is content before the text but still whitespace before the shortcut',
    () => {
      const editor = makeEditor(<editor>
        <paragraph>
          <text>
            w {shortcut}thing{shortcut.slice(0, -1)}
            <cursor />
          </text>
        </paragraph>
      </editor>)

      editor.insertText(shortcut.slice(-1))
      expect(editor).toEqualEditor(makeEditor(<editor marks={{}}>
        <paragraph>
          <text>w </text>
          <text {...{ [markName]: true }}>
            thing
            <cursor />
          </text>
        </paragraph>
      </editor>))
    }
  )
  test(
    "does match if there's text in the same block with marks and still whitespace before the new place",
    () => {
      const editor = makeEditor(<editor>
        <paragraph>
          <text bold>some text</text>
          <text>
            more {shortcut}something{shortcut.slice(0, -1)}
            <cursor />
          </text>
        </paragraph>
      </editor>)

      editor.insertText(shortcut.slice(-1))
      expect(editor).toEqualEditor(makeEditor(<editor marks={{}}>
        <paragraph>
          <text bold>some text</text>
          <text>more </text>
          <text {...{ [markName]: true }}>
            something
            <cursor />
          </text>
        </paragraph>
      </editor>))
    }
  )
  test(
    "does match if there's lots of text in the same block with marks and still whitespace before the new place",
    () => {
      const editor = makeEditor(<editor>
        <paragraph>
          <text keyboard>some text</text>
          <text bold>some text</text>
          <text keyboard>some text</text>
          <text bold>some text</text>
          <text keyboard>some text</text>
          <text bold>some text</text>
          <text keyboard>some text</text>
          <text bold>some text</text>
          <text keyboard>some text</text>
          <text bold>some text</text>
          <text keyboard>some text</text>
          <text bold>some text</text>
          <text keyboard>some text</text>
          <text bold>some text</text>
          <text>
            more {shortcut}something{shortcut.slice(0, -1)}
            <cursor />
          </text>
        </paragraph>
      </editor>)

      editor.insertText(shortcut.slice(-1))
      expect(editor).toEqualEditor(makeEditor(<editor marks={{}}>
        <paragraph>
          <text keyboard>some text</text>
          <text bold>some text</text>
          <text keyboard>some text</text>
          <text bold>some text</text>
          <text keyboard>some text</text>
          <text bold>some text</text>
          <text keyboard>some text</text>
          <text bold>some text</text>
          <text keyboard>some text</text>
          <text bold>some text</text>
          <text keyboard>some text</text>
          <text bold>some text</text>
          <text keyboard>some text</text>
          <text bold>some text</text>
          <text>more </text>
          <text {...{ [markName]: true }}>
            something
            <cursor />
          </text>
        </paragraph>
      </editor>))
    }
  )

  test(
    'undo only undos adding the mark and removing the shortcut, keeps the inserted text',
    () => {
      const editor = makeEditor(<editor>
        <paragraph>
          <text>
            {shortcut}something{shortcut.slice(0, -1)}
            <cursor />
          </text>
        </paragraph>
      </editor>)

      editor.insertText(shortcut.slice(-1))
      editor.undo()
      expect(editor).toEqualEditor(makeEditor(<editor>
        <paragraph>
          <text>
            {shortcut}something{shortcut}
            <cursor />
          </text>
        </paragraph>
      </editor>))
    }
  )
})

test(
  'inserting a break at the end of a block with a mark removes the mark',
  () => {
    const editor = makeEditor(<editor marks={{ bold: true }}>
      <paragraph>
        <text bold>
          some content
          <cursor />
        </text>
      </paragraph>
      <paragraph>
        <text />
      </paragraph>
    </editor>)

    editor.insertBreak()
    editor.insertText('a')
    expect(editor).toMatchInlineSnapshot(`
      <editor>
        <paragraph>
          <text
            bold={true}
          >
            some content
          </text>
        </paragraph>
        <paragraph>
          <text>
            a
            <cursor />
          </text>
        </paragraph>
        <paragraph>
          <text />
        </paragraph>
      </editor>
    `)
  }
)

test("inserting a break in the middle of text doesn't remove the mark", () => {
  const editor = makeEditor(<editor marks={{ bold: true }}>
    <paragraph>
      <text bold>
        some <cursor /> content
      </text>
    </paragraph>
    <paragraph>
      <text />
    </paragraph>
  </editor>)

  editor.insertBreak()
  editor.insertText('a')
  expect(editor).toMatchInlineSnapshot(`
    <editor
      marks={
        {
          "bold": true,
        }
      }
    >
      <paragraph>
        <text
          bold={true}
        >
          some 
        </text>
      </paragraph>
      <paragraph>
        <text
          bold={true}
        >
          a
          <cursor />
           content
        </text>
      </paragraph>
      <paragraph>
        <text />
      </paragraph>
    </editor>
  `)
})
