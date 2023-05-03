import { useEffect, useRef, useState } from "react";
import { useSearchBox } from "react-instantsearch-hooks-web";

const SearchBoxWrapper = ({
  children,
  placeholder = "Search products...",
  ...rest
}) => {
  const { query, refine, isSearchStalled } = useSearchBox(rest);
  const [value, setValue] = useState(query);
  const inputRef = useRef(null);

  const onReset = () => {
    setValue("");
  };

  const onChange = (event) => {
    setValue(event.currentTarget.value);
  };

  useEffect(() => {
    if (query !== value) {
      refine(value);
    }
    // We don't want to track when the InstantSearch query changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    // We bypass the state update if the input is focused to avoid concurrent
    // updates when typing.
    if (document.activeElement !== inputRef.current && query !== value) {
      setValue(query);
    }
    // We don't want to track when the React state value changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const state = {
    value,
    inputRef,
    isSearchStalled,
    onChange,
    onReset,
    placeholder,
  };

  return children(state);
};

export default SearchBoxWrapper;
